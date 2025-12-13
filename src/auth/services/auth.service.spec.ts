import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User } from '../../_contracts';
import { UserEntity } from '../../users/dao/user.entity';
import { UsersService } from '../../users/services/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      const email = faker.internet.email();
      const result = await service.validateUser(email, faker.string.sample(10));

      expect(result).toBeNull();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null if password does not match', async () => {
      const email = faker.internet.email();

      const mockUser = {
        email,
        passwordHash: await bcrypt.hash(faker.string.sample(10), 10),
      } as UserEntity;
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(email, faker.string.sample(10));
      expect(result).toBeNull();
    });

    it('should return user if password matches', async () => {
      const password = faker.string.sample(10);
      const email = faker.internet.email();
      const passwordHash = await bcrypt.hash(password, 10);
      const mockUser = {
        email,
        passwordHash,
      } as UserEntity;

      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const mockUser: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const token = faker.string.sample(32);

      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(mockUser);

      expect(result).toEqual({ accessToken: token });
      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, id: mockUser.id });
    });
  });
});
