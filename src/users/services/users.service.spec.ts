import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users.repository';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user when found', async () => {
      const email = faker.internet.email();

      const mockUser = {
        id: faker.string.uuid(),
        email,
        passwordHash: faker.internet.password(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(email);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        email,
      });
      expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user is not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const email = faker.internet.email();

      const result = await service.findOneByEmail(email);

      expect(result).toBeNull();
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        email,
      });
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const email = faker.internet.email();

      const createUserDto = {
        email,
        password: faker.internet.password(),
      };

      const mockCreatedUser = {
        id: faker.string.uuid(),
        email,
        passwordHash: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(mockUsersRepository.create).toHaveBeenCalledTimes(1);

      const createCall = mockUsersRepository.create.mock.calls[0][0];
      expect(createCall.email).toBe(createUserDto.email);
      expect(createCall.passwordHash).toBeDefined();
      expect(createCall.passwordHash).not.toBe(createUserDto.password);

      // hash starts '$2[aby]'
      expect(createCall.passwordHash).toMatch(/^\$2[aby]\$/);
    });
  });
});
