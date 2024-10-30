import { Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class ApiUser {
    private readonly logger = new Logger(ApiUser.name);

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isAdmin: boolean;

    @Column({ unique: true, nullable: false })
    email: string;

    /** @dev Unhashed, needed as identifier too by Auth.guard */
    @Column({ unique: true, nullable: false })
    apiKey: string;

    /** @dev Also need to authenticate, but additional protection if api keys are leaked through DB */
    @Column({ unique: true, nullable: false })
    apiSecretTokenHash: string;

    @Column({ unique: true, nullable: false })
    apiSecretTokenSalt: string;

    @BeforeInsert()
    async createSecureApiKey() {
        this.apiKey = randomBytes(48).toString("hex");
        const secretToken = randomBytes(32).toString("hex");
        this.logger.log(
            `New Secret Token created: ${secretToken} (you WILL NOT be able to see this again!`,
        );

        this.apiSecretTokenSalt = await bcrypt.genSalt();
        this.apiSecretTokenHash = await bcrypt.hash(
            secretToken,
            this.apiSecretTokenSalt,
        );
    }

    @CreateDateColumn()
    created: Date;
}
