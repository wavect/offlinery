import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { BlacklistedRegion } from '../blacklisted-region/blacklisted-region.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from '../DTOs/create-user.dto';
import { UpdateUserDTO } from '../DTOs/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  EApproachChoice,
  EDateMode,
  EGender,
  EVerificationStatus,
} from '../types/user.types';

jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let blacklistedRegionRepository: Repository<BlacklistedRegion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BlacklistedRegion),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    blacklistedRegionRepository = module.get<Repository<BlacklistedRegion>>(
      getRepositoryToken(BlacklistedRegion),
    );
  });

  describe('createUser', () => {
    it('should create a new user with images and blacklisted regions', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        email: 'john@example.com',
        clearPassword: 'password123',
        wantsEmailUpdates: true,
        birthDay: new Date('1990-01-01'),
        gender: EGender.MAN,
        genderDesire: EGender.WOMAN,
        verificationStatus: EVerificationStatus.PENDING,
        approachChoice: EApproachChoice.APPROACH,
        blacklistedRegions: [
          {
            location: {
              type: 'Point',
              coordinates: [40.7128, -74.006],
            },
            radius: 1000,
          },
        ],
        approachFromTime: new Date('2023-01-01T09:00:00'),
        approachToTime: new Date('2023-01-01T17:00:00'),
        bio: 'I love hiking and reading',
        dateMode: EDateMode.LIVE,
      };

      const mockImages = [
        {
          filename: 'test1.jpg',
          mimetype: 'image/jpeg',
          path: '/path/to/image1',
        },
      ];

      const mockUser = new User();
      Object.assign(mockUser, createUserDto);
      mockUser.id = '1';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (userRepository.save as jest.Mock).mockResolvedValue(mockUser);
      (blacklistedRegionRepository.save as jest.Mock).mockResolvedValue({
        id: 1,
        ...createUserDto.blacklistedRegions[0],
      });

      const result = await userService.createUser(
        createUserDto,
        mockImages as Express.Multer.File[],
      );

      expect(result).toEqual(mockUser);
      expect(userRepository.save).toHaveBeenCalled();
      expect(blacklistedRegionRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDTO = {
        firstName: 'John Updated',
        bio: 'Updated bio',
      };

      const mockImages = [
        {
          filename: 'test1_updated.jpg',
          mimetype: 'image/jpeg',
          path: '/path/to/updated_image1',
        },
      ];

      const existingUser = new User();
      existingUser.id = userId;
      existingUser.firstName = 'John';
      existingUser.bio = 'Original bio';

      const updatedUser = new User();
      Object.assign(updatedUser, existingUser, updateUserDto);

      (userRepository.findOneBy as jest.Mock).mockResolvedValue(existingUser);
      (userRepository.save as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.updateUser(
        userId,
        updateUserDto,
        mockImages as Express.Multer.File[],
      );

      expect(result).toEqual(updatedUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
      const userId = '999';
      const updateUserDto: UpdateUserDTO = { firstName: 'John Updated' };

      (userRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.updateUser(userId, updateUserDto),
      ).rejects.toThrow('User not found');
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [new User(), new User()];
      (userRepository.find as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.findAll();

      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = 1;
      (userRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await userService.remove(userId);

      expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      const userId = '1';
      const mockUser = new User();
      mockUser.id = userId;

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findUserById(userId);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['blacklistedRegions'],
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = '999';

      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(userService.findUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
