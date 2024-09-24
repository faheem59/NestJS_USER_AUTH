import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { redisStore } from "cache-manager-redis-yet";
import { RedisClientService } from "./redis-client.service";

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: "localhost",
      port: 6379,
      ttl: 60 * 60 * 3600,
    }),
  ],
  providers: [RedisClientService],
})
export class RedisClientModule {}
