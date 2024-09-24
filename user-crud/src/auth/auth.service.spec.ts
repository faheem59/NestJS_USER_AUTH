import { UserRepository } from "../user/repositories/user-repository";
import { UserStatus } from "../enum/permission-enum";
import { AuthService } from "./auth.service";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../user/entities/user.entity";
import { plainToClass } from "class-transformer";
import { SUCCESS_MESSAGES } from "../utils/success-messges";
import {
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ClientService } from "../redisClient/client.service";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { RefreshToken } from "../user/entities/refreshToken.entity";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dto/login-dto";

describe("AuthService", () => {
  let authService: AuthService;
  let userRepository: Partial<UserRepository>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let refreshTokenRepository: Partial<Repository<RefreshToken>>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let clientService: ClientService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let rabbitmqService: RabbitmqService;

  const mockUser = {
    id: 1,
    name: "Faheem",
    email: "faheem@gmail.com",
    phonenumber: "9898989898",
    role: null,
    status: UserStatus.ACTIVE,
    password: "hashedPassword",
  };

  const mockLoginUser: LoginDto = {
    email: "faheem@gmail.com",
    password: "password",
  };

  const mockUserRepository = {
    creatUser: jest.fn(),
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mockAccessToken"),
  };

  const mockClientService = {
    setValue: jest.fn().mockResolvedValue(undefined),
  };

  const mockRabbitmqService = {
    sendMessage: jest.fn().mockResolvedValue(undefined),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(undefined),
    findOne: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ClientService,
          useValue: mockClientService,
        },
        {
          provide: RabbitmqService,
          useValue: mockRabbitmqService,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Partial<UserRepository>>(UserRepository);
    refreshTokenRepository = module.get<Partial<Repository<RefreshToken>>>(
      getRepositoryToken(RefreshToken),
    );
  });

  describe("createUser", () => {
    it("should create a new user and return it", async () => {
      jest
        .spyOn(userRepository, "creatUser")
        .mockResolvedValue(mockUser as unknown as User);

      const result = await authService.createUser(mockUser);

      expect(userRepository.creatUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        message: SUCCESS_MESSAGES.USER_CREATED,
        user: plainToClass(User, mockUser),
      });
    });

    it("should throw an InternalServerErrorException if creatUser fails", async () => {
      jest
        .spyOn(userRepository, "creatUser")
        .mockRejectedValue(new Error("Error"));

      await expect(authService.createUser(mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("validateUser", () => {
    it("should login a user and return an access token", async () => {
      const userWithRole = { ...mockUser, role: { name: "user" } };
      jest
        .spyOn(userRepository, "findOneByEmail")
        .mockResolvedValue(userWithRole as unknown as User);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      jest
        .spyOn(authService, "generateAccesstoken")
        .mockResolvedValue("mockAccessToken");

      const result = await authService.validateUser(mockLoginUser);

      expect(userRepository.findOneByEmail).toHaveBeenCalledWith(
        mockLoginUser.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginUser.password,
        mockUser.password,
      );

      expect(result).toEqual({
        message: SUCCESS_MESSAGES.USER_LOGGEDIN,
        user: expect.any(User),
        accessToken: "mockAccessToken",
      });
    });

    it("should throw BadRequestException if user not found", async () => {
      jest.spyOn(userRepository, "findOneByEmail").mockResolvedValue(null);

      await expect(authService.validateUser(mockLoginUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if password is invalid", async () => {
      jest
        .spyOn(userRepository, "findOneByEmail")
        .mockResolvedValue(mockUser as unknown as User);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      await expect(authService.validateUser(mockLoginUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if user is inactive", async () => {
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      jest
        .spyOn(userRepository, "findOneByEmail")
        .mockResolvedValue(inactiveUser as unknown as User);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      await expect(authService.validateUser(mockLoginUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      jest.spyOn(userRepository, "findOneByEmail").mockImplementation(() => {
        throw new Error("Some error");
      });

      await expect(authService.validateUser(mockLoginUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
  describe("generateRefereshtoken", () => {
    it("should generate a refresh token and store it in the cache", async () => {
      const userId = 1;
      const mockRefreshToken = "mockRefreshToken";

      jest.spyOn(mockJwtService, "sign").mockReturnValue(mockRefreshToken);
      jest.spyOn(mockClientService, "setValue").mockResolvedValue(undefined);

      const result = await authService.generateRefereshtoken(userId);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: userId },
        { expiresIn: "7d" },
      );
      expect(mockClientService.setValue).toHaveBeenCalledWith(
        `refresh_token`,
        JSON.stringify(mockRefreshToken),
      );
      expect(result).toBe(mockRefreshToken);
    });

    it("should throw an InternalServerErrorException if an error occurs", async () => {
      const userId = 1;

      jest.spyOn(mockJwtService, "sign").mockImplementation(() => {
        throw new Error("Error generating token");
      });

      await expect(authService.generateRefereshtoken(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
