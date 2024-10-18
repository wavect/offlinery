import { CreateUserDTO } from "@/DTOs/create-user.dto";
import { LocationUpdateDTO } from "@/DTOs/location-update.dto";
import { ResetPasswordResponseDTO } from "@/DTOs/reset-password.dto";
import { SignInResponseDTO } from "@/DTOs/sign-in-response.dto";
import { UpdateUserPasswordDTO } from "@/DTOs/update-user-password";
import { UpdateUserDTO } from "@/DTOs/update-user.dto";
import { UserDeletionSuccessDTO } from "@/DTOs/user-deletion-success.dto";
import { UserRequestDeletionFormSuccessDTO } from "@/DTOs/user-request-deletion-form-success.dto";
import { UserResetPwdSuccessDTO } from "@/DTOs/user-reset-pwd-success.dto";
import { AuthService } from "@/auth/auth.service";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { MatchingService } from "@/transient-services/matching/matching.service";
import {
    EApproachChoice,
    EEmailVerificationStatus,
    ELanguage,
    EVerificationStatus,
} from "@/types/user.types";
import {
    API_VERSION,
    BE_ENDPOINT,
    parseToAgeRangeString,
} from "@/utils/misc.utils";
import {
    EMAIL_CODE_EXPIRATION_IN_MS,
    generate6DigitEmailCode,
    RESEND_EMAIL_CODE_TIMEOUT_IN_MS,
} from "@/utils/security.utils";
import { MailerService } from "@nestjs-modules/mailer";
import {
    BadRequestException,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { Expo } from "expo-server-sdk";
import * as fs from "fs";
import { I18nService } from "nestjs-i18n";
import * as path from "path";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { User } from "./user.entity";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    private readonly uploadDir = "uploads/img";

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(BlacklistedRegion)
        private blacklistedRegionRepository: Repository<BlacklistedRegion>,
        @InjectRepository(PendingUser)
        private pendingUserRepo: Repository<PendingUser>,
        @Inject(forwardRef(() => MatchingService))
        private matchingService: MatchingService,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
        private mailService: MailerService,
        private readonly i18n: I18nService,
    ) {}

    private async saveFiles(
        files: Express.Multer.File[],
    ): Promise<{ index: number; filePath: string }[]> {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }

        const savedFilePaths = await Promise.all(
            files.map(async (file) => {
                const index = Number(file.originalname);

                if (isNaN(index)) {
                    throw new Error(
                        `Could not parse image index to number. Tried to parse following value: ${file.originalname}`,
                    );
                }

                // mimeType examples: "image/jpeg", "image/png".
                // Since we only allow image files, we can assume mimeType always follows this scheme.
                const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}.${file.mimetype.split("/")[1]}`;
                const filePath = path.join(this.uploadDir, uniqueFilename);
                await fs.promises.writeFile(filePath, file.buffer);
                return { index, filePath: uniqueFilename };
            }),
        );

        return savedFilePaths.sort((a, b) => a.index - b.index);
    }

    private async deleteImages(
        userId: string,
        indexes: number[] | undefined,
    ): Promise<User | undefined> {
        if (!indexes || indexes.length === 0) {
            return;
        }

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        const imagePaths = user.imageURIs;
        const deletedPaths: string[] = [];
        for (const index of indexes) {
            const imagePath = imagePaths[index];

            if (index >= 0 && index < imagePaths.length && imagePath) {
                const filePath = path.join(this.uploadDir, imagePath);
                try {
                    await fs.promises.unlink(filePath);
                    deletedPaths.push(imagePaths[index]);
                } catch (error) {
                    this.logger.error(
                        `Failed to delete file: ${filePath}. Message: ${error}`,
                    );
                }
            }
        }

        user.imageURIs = imagePaths.filter(
            (path) => !deletedPaths.includes(path),
        );

        return user;
    }
    async hashNewPassword(user: User, clearPwd: string): Promise<User> {
        // @dev https://docs.nestjs.com/security/encryption-and-hashing
        user.passwordSalt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash(clearPwd, user.passwordSalt);
        return user;
    }

    async createUser(
        createUserDto: CreateUserDTO,
        images: Express.Multer.File[],
    ): Promise<SignInResponseDTO> {
        let user = new User();
        Object.assign(user, createUserDto);

        // Double check if user's email actually is verified.
        await this.pendingUserRepo.findOneByOrFail({
            email: user.email,
            verificationStatus: EEmailVerificationStatus.VERIFIED,
        });

        await this.hashNewPassword(user, createUserDto.clearPassword);

        // Save images
        user.imageURIs = (await this.saveFiles(images)).map(
            (image) => image.filePath,
        );

        // Save blacklisted regions
        if (createUserDto.blacklistedRegions) {
            user.blacklistedRegions = await Promise.all(
                createUserDto.blacklistedRegions.map(async (region) => {
                    const blacklistedRegion = new BlacklistedRegion();
                    blacklistedRegion.location = region.location;
                    blacklistedRegion.radius = region.radius;
                    return await this.blacklistedRegionRepository.save(
                        blacklistedRegion,
                    );
                }),
            );
        }
        user = this.userRepository.create(user); // more reliably calls beforeInsert hook on entity
        await this.userRepository.save(user);
        return this.authService.signIn(
            createUserDto.email,
            createUserDto.clearPassword,
        );
    }

    async updateUserPassword(
        id: string,
        updateUserPwd: UpdateUserPasswordDTO,
    ): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        // @dev make sure old pwd is correct
        const isPasswordValid = await bcrypt.compare(
            updateUserPwd.oldPassword,
            user.passwordHash,
        );
        if (!isPasswordValid) {
            this.logger.debug(
                `Cannot change password with invalid old password: ${user.id}`,
            );
            throw new UnauthorizedException("Old password invalid.");
        }

        await this.hashNewPassword(user, updateUserPwd.newPassword);

        await this.userRepository.save(user);
        return user;
    }

    async updateUser(
        id: string,
        updateUserDto: UpdateUserDTO,
        images?: Express.Multer.File[],
    ): Promise<User> {
        let user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        // Update user properties
        Object.assign(user, updateUserDto);

        user =
            (await this.deleteImages(id, updateUserDto.indexImagesToDelete)) ??
            user;

        // Update images if provided
        if (images && images.length > 0) {
            const newImages = await this.saveFiles(images);
            for (let index = 0; index < newImages.length; index++) {
                const image = newImages[index];
                user.imageURIs[image.index] = image.filePath;
            }
        }

        // Update blacklisted regions if provided
        if (updateUserDto.blacklistedRegions) {
            // Remove old blacklisted regions
            if (user.blacklistedRegions) {
                this.logger.debug(
                    `Updating ${user.blacklistedRegions.length} blacklisted regions for user ${user.id}`,
                );
                const blacklistedRegions =
                    await this.blacklistedRegionRepository.findBy(
                        user.blacklistedRegions.map((region) => ({
                            id: region.id,
                        })),
                    );
                await this.blacklistedRegionRepository.remove(
                    blacklistedRegions,
                );
            }

            // Add new blacklisted regions
            user.blacklistedRegions = await Promise.all(
                updateUserDto.blacklistedRegions.map(async (region) => {
                    const blacklistedRegion = new BlacklistedRegion();
                    blacklistedRegion.location = region.location;
                    blacklistedRegion.radius = region.radius;
                    return await this.blacklistedRegionRepository.save(
                        blacklistedRegion,
                    );
                }),
            );
        }

        if (
            updateUserDto.approachChoice &&
            this.isVerificationNeeded(updateUserDto, user)
        ) {
            user.verificationStatus = EVerificationStatus.PENDING;
        }

        if (updateUserDto.ageRange) {
            user.ageRangeString = parseToAgeRangeString(updateUserDto.ageRange);
        }

        return await this.userRepository.save(user);
    }

    private isVerificationNeeded(updateUserDto: UpdateUserDTO, user: User) {
        return (
            user.verificationStatus !== EVerificationStatus.VERIFIED &&
            updateUserDto.approachChoice !== EApproachChoice.BE_APPROACHED
        );
    }

    findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async deleteUserByDeletionToken(
        deletionToken: string,
    ): Promise<UserDeletionSuccessDTO> {
        const userToDelete = await this.userRepository.findOneBy({
            deletionToken,
        });
        if (!userToDelete) {
            throw new NotFoundException(
                `Unknown deletion token, no user found: ${deletionToken}`,
            );
        }
        if (new Date() > userToDelete.deletionTokenExpires) {
            throw new ForbiddenException(
                `Deletion token has expired on ${userToDelete.deletionTokenExpires}`,
            );
        }

        await this.userRepository.delete({ deletionToken });
        await this.pendingUserRepo.delete({ email: userToDelete.email });
        this.logger.debug(`User ${userToDelete.id} successfully deleted!`);

        const lang = userToDelete.preferredLanguage || ELanguage.en;
        return {
            id: userToDelete.id,
            dataDeleted: true,
            message: await this.i18n.translate(
                "main.view.account-deletion-confirmation.message",
                { lang },
            ),
            subject: await this.i18n.translate(
                "main.view.account-deletion-confirmation.subject",
                { lang },
            ),
        };
    }

    async changeUserPasswordByResetPwdLink(
        email: string,
        resetPasswordCode: string,
        newClearPassword: string,
    ): Promise<UserResetPwdSuccessDTO> {
        const userToUpdate = await this.userRepository.findOneBy({
            email,
            resetPasswordCode,
        });
        if (!userToUpdate) {
            throw new NotFoundException(
                `Unknown email, no user found or verificationCode invalid: ${email}, ${resetPasswordCode}`,
            );
        }
        const currentTime = new Date().getTime();
        const issuedTime = userToUpdate.resetPasswordCodeIssuedAt.getTime();

        if (currentTime - issuedTime > EMAIL_CODE_EXPIRATION_IN_MS) {
            throw new ForbiddenException("Reset password code has expired.");
        }
        // @dev token can only be used once
        userToUpdate.resetPasswordCode = undefined;
        userToUpdate.resetPasswordCodeIssuedAt = undefined;
        await this.hashNewPassword(userToUpdate, newClearPassword);
        await this.userRepository.save(userToUpdate);

        this.logger.debug(
            `User ${userToUpdate.id}'s password successfully reset!`,
        );
        return {
            id: userToUpdate.id,
            passwordReset: true,
        };
    }

    async requestPasswordChangeAsForgotten(
        email: string,
    ): Promise<ResetPasswordResponseDTO> {
        const user = await this.userRepository.findOneBy({ email });
        if (!user) {
            throw new NotFoundException(
                `User with email ${email} does not exist!`,
            );
        }

        if (
            Date.now() <
            new Date(user.resetPasswordCodeIssuedAt).getTime() +
                RESEND_EMAIL_CODE_TIMEOUT_IN_MS
        ) {
            this.logger.debug(
                `Already issued reset password code that has not yet expired, returning old data.`,
            );
            return {
                email: user.email,
                timeout: RESEND_EMAIL_CODE_TIMEOUT_IN_MS,
                codeIssuedAt: user.resetPasswordCodeIssuedAt,
            };
        }

        const resetPwdCode = generate6DigitEmailCode();
        user.resetPasswordCode = resetPwdCode;
        user.resetPasswordCodeIssuedAt = new Date();

        const lang = user.preferredLanguage || ELanguage.en;
        this.logger.debug(
            `Sending new email to ${user.firstName} with changePwd code ${resetPwdCode} in ${lang}.`,
        );
        await this.mailService.sendMail({
            to: user.email,
            subject: await this.i18n.translate(
                "main.email.request-password-reset.subject",
                { lang },
            ),
            template: "request-password-reset",
            context: {
                firstName: user.firstName,
                resetPwdCode,
                t: (key: string, params?: Record<string, any>) =>
                    this.i18n.translate(
                        `main.email.request-password-reset.${key}`,
                        { lang, args: { ...(params?.hash ?? params) } },
                    ),
            },
        });
        await this.userRepository.save(user);
        return {
            email: user.email,
            timeout: RESEND_EMAIL_CODE_TIMEOUT_IN_MS,
            codeIssuedAt: user.resetPasswordCodeIssuedAt,
        };
    }

    private async requestAccountDeletion(user: User) {
        if (
            user.deletionTokenExpires &&
            user.deletionTokenExpires > new Date()
        ) {
            this.logger.debug(
                `Not resending deletion request email as token as not yet expired.`,
            );
            return;
        }

        user.deletionTokenExpires = new Date(
            new Date().getTime() + 24 * 60 * 60 * 1000,
        ); // 24h expiration window
        user.deletionToken = randomBytes(48).toString("hex");

        const deletionLink = `${BE_ENDPOINT}/v${API_VERSION}/user/delete/${user.deletionToken}`;

        const lang = user.preferredLanguage || ELanguage.en;
        this.logger.debug(
            `Sending new email to ${user.email} with deletionLink ${deletionLink} in ${lang}.`,
        );
        await this.mailService.sendMail({
            to: user.email,
            subject: await this.i18n.translate(
                "main.email.request-account-deletion.subject",
                { lang },
            ),
            template: "request-account-deletion",
            context: {
                firstName: user.firstName,
                deletionLink,
                t: (key: string, params?: Record<string, any>) =>
                    this.i18n.translate(
                        `main.email.request-account-deletion.${key}`,
                        { lang, args: { ...(params?.hash ?? params) } },
                    ),
            },
        });
        await this.userRepository.save(user);
    }

    /** @dev Looks like users also need to be able to delete their accounts without using the app. */
    async requestAccountDeletionViaForm(
        email: string,
    ): Promise<UserRequestDeletionFormSuccessDTO> {
        this.logger.debug(
            `Somebody is requesting account deletion of ${email} via public form.`,
        );
        const user = await this.userRepository.findOneBy({ email });
        if (!user) {
            this.logger.debug(`User with email ${email} does not exist!`);
            throw new BadRequestException("Invalid request data."); // @dev for security
        }
        await this.requestAccountDeletion(user);

        return {
            id: user.id,
            deletionRequested: true,
        };
    }

    async requestAccountDeletionViaApp(id: string) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            this.logger.debug(`User with id ${id} does not exist!`);
            throw new BadRequestException("Invalid request data."); // @dev for security
        }
        await this.requestAccountDeletion(user);
    }

    async findUserById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ["blacklistedRegions"], // Include related entities if needed
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findUserByEmailOrFail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ["blacklistedRegions"], // Include related entities if needed
        });

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        return user;
    }

    async updatePushToken(userId: string, pushToken: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (!Expo.isExpoPushToken(pushToken)) {
            this.logger.error(
                `Push token ${pushToken} is not a valid Expo push token`,
            );
            throw new Error(`Expo push token is invalid: ${pushToken}`);
        }

        user.pushToken = pushToken;
        this.logger.debug(
            `Saved new notification push token for user ${user.id}`,
        );
        return await this.userRepository.save(user);
    }

    async updateLocation(
        userId: string,
        { latitude, longitude }: LocationUpdateDTO,
    ): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        user.location = { type: "Point", coordinates: [longitude, latitude] };
        user.locationLastTimeUpdated = new Date();
        const updatedUser = await this.userRepository.save(user);

        // Check for matches and send notifications (from a semantic perspective we only send notifications if a person to be approached sends a location update)
        if (
            user.approachChoice === EApproachChoice.BOTH ||
            user.approachChoice === EApproachChoice.BE_APPROACHED
        ) {
            this.logger.debug(
                `Sending notifications to users that want to potentially approach userId ${user.id}`,
            );
            await this.matchingService.notifyMatches(user);
        }

        return updatedUser;
    }

    async storeRefreshToken(
        userId: string,
        refreshToken: string,
        expiresAt: Date,
    ): Promise<any> {
        await this.userRepository.update(userId, {
            refreshToken,
            refreshTokenExpires: expiresAt,
        });
    }

    async findUserByRefreshToken(
        refreshToken: string,
    ): Promise<User | undefined> {
        return this.userRepository.findOne({
            where: {
                refreshToken,
            },
        });
    }

    async removeRefreshToken(userId: string): Promise<void> {
        await this.userRepository.update(userId, {
            refreshToken: null,
            refreshTokenExpires: null,
        });
    }
}
