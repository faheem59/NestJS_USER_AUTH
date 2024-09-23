import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { Common } from "../enum/common-enum";

@Injectable()
export class ClientService {
  constructor(@Inject(Common.CACHE_MANAGER) private cacheManager: Cache) {}

  async setValue(key: string, value: any): Promise<void> {
    try {
      await this.cacheManager.set(key, value);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getValue(key: string): Promise<any> {
    try {
      return await this.cacheManager.get(key);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async delKey(key: string): Promise<any> {
    try {
      return await this.cacheManager.del(key);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
