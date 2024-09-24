import { Repository } from "typeorm";

import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RefreshToken } from "../entities/refreshToken.entity";

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenReposoitry: Repository<RefreshToken>,
  ) {}

  // Save the token and also update the token if exist

  async saveUpdateToken(userId: number, token: string): Promise<void> {
    const existingToken = await this.refreshTokenReposoitry.findOne({
      where: { user: { id: userId } },
    });

    if (existingToken) {
      existingToken.token = token;
      existingToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await this.refreshTokenReposoitry.save(existingToken);
    } else {
      const refreshToken = this.refreshTokenReposoitry.create({
        token,
        user: { id: userId } as any,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await this.refreshTokenReposoitry.save(refreshToken);
    }
  }

  // find token
  async findToken(token: string): Promise<RefreshToken> {
    return this.refreshTokenReposoitry.findOne({
      where: { token },
      relations: ["user", "user.role"],
    });
  }

  // find user wit id and token
  async findTokenById(userId: number): Promise<RefreshToken | null> {
    try {
      return await this.refreshTokenReposoitry.findOne({
        where: { user: { id: userId } },
        relations: ["user"],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
