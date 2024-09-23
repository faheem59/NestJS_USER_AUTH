import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "./repositories/user-repository";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ERROR_MESSAGES } from "./utils/error-messages-constant";
import { SUCCESS_MESSAGES } from "./utils/success-messges-constant";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { UserStatus } from "./enum/permission-enum";
import { AuthService } from "src/auth/auth.service";
import { permission } from "process";

describe("UserService", () => {
  let userService: UserService;
  let authService: AuthService;
  let userRepository: Partial<UserRepository>;

  const mockUser = {
    id: 1,
    name: "Faheem",
    email: "faheem@gmail.com",
    phonenumber: "9898989898",
    role: null,
    status: UserStatus.ACTIVE,
    password: "faheem@123",
    refreshTokens: [{ token: "224ff" }],
    permissions: null,
    resetToken: "ff",
    resetTokenExpiration: "24-02-12",
    isVerified: false,
  };

  const mockUserRepository = {
    creatUser: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Partial<UserRepository>>(UserRepository);
  });

  describe("create", () => {
    it("should create a new user and return it", async () => {
      jest
        .spyOn(userRepository, "creatUser")
        .mockResolvedValue(mockUser as unknown as User);

      const result = await authService.create(mockUser);

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

      await expect(authService.create(mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("findAll", () => {
    it("should return all users without sensitive info", async () => {
      const users = [mockUser as unknown as User];
      jest.spyOn(userRepository, "findAll").mockResolvedValue(users);

      const result = await userService.findAll();

      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        message: SUCCESS_MESSAGES.USER_RETRIEVED,
        users: users.map((user) => plainToClass(User, user)),
      });
    });

    it("should throw an InternalServerErrorException if findAll fails", async () => {
      jest
        .spyOn(userRepository, "findAll")
        .mockRejectedValue(new Error("Error"));

      await expect(userService.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("findById", () => {
    it("should find and return user by ID", async () => {
      jest
        .spyOn(userRepository, "findById")
        .mockResolvedValue(mockUser as unknown as User);

      const result = await userService.findById(mockUser.id);

      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        message: SUCCESS_MESSAGES.USER_RETRIEVED,
        user: plainToClass(User, mockUser),
      });
    });

    it("should throw a NotFoundException if user is not found", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(null);

      await expect(userService.findById(mockUser.id)).rejects.toThrow(
        new NotFoundException(
          ERROR_MESSAGES.USER_NOT_FOUND.replace("{id}", mockUser.id.toString()),
        ),
      );
    });

    it("should throw an InternalServerErrorException if findById fails", async () => {
      jest
        .spyOn(userRepository, "findById")
        .mockRejectedValue(new Error("Error"));

      await expect(userService.findById(mockUser.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("update", () => {
    it("should update a user and return it", async () => {
      const updateUserDto: UpdateUserDto = {
        name: "Anil",
        phonenumber: "9876543210",
        email: "fa@gmail.com",
      };
      jest.spyOn(userRepository, "updateOne").mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      } as unknown as User);

      const result = await userService.update(mockUser.id, updateUserDto);

      expect(userRepository.updateOne).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
      expect(result).toEqual({
        message: SUCCESS_MESSAGES.USER_UPDATED,
        user: plainToClass(User, { ...mockUser, ...updateUserDto }),
      });
    });

    it("should throw a NotFoundException if user to update is not found", async () => {
      const updateUserDto: UpdateUserDto = {
        name: "Updated Name",
        phonenumber: "9876543210",
        email: "fa@gmail.com",
      };
      jest.spyOn(userRepository, "updateOne").mockResolvedValue(null);

      await expect(
        userService.update(mockUser.id, updateUserDto),
      ).rejects.toThrow(new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND));
    });

    it("should throw an InternalServerErrorException if update fails", async () => {
      const updateUserDto: UpdateUserDto = {
        name: "Updated Name",
        phonenumber: "9876543210",
        email: "fa@gmail.com",
      };
      jest
        .spyOn(userRepository, "updateOne")
        .mockRejectedValue(new Error("Error"));

      await expect(
        userService.update(mockUser.id, updateUserDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("remove", () => {
    it("should remove a user and return a success message", async () => {
      jest
        .spyOn(userRepository, "findById")
        .mockResolvedValue(mockUser as unknown as User);
      jest.spyOn(userRepository, "destroy").mockResolvedValue();

      const result = await userService.remove(mockUser.id);

      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userRepository.destroy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ message: SUCCESS_MESSAGES.USER_REMOVED });
    });

    it("should throw a NotFoundException if user to remove is not found", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(null);

      await expect(userService.remove(mockUser.id)).rejects.toThrow(
        new NotFoundException(
          ERROR_MESSAGES.USER_NOT_FOUND.replace("{id}", mockUser.id.toString()),
        ),
      );
    });

    it("should throw an InternalServerErrorException if remove fails", async () => {
      jest
        .spyOn(userRepository, "findById")
        .mockResolvedValue(mockUser as unknown as User);
      jest
        .spyOn(userRepository, "destroy")
        .mockRejectedValue(new Error("Error"));

      await expect(userService.remove(mockUser.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
