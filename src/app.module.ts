import { Module } from '@nestjs/common';
// Removed schedule imports temporarily
// import { ScheduleModule } from '@nestjs/schedule';
// import { Reflector } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { Reflector } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './weather/weather.module';
import { redisStore } from 'cache-manager-redis-store';
import { HistoryModule } from './history/history.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    // ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        url: config.get<string>('REDIS_URL'),
        ttl: 600,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    WeatherModule,
    HistoryModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
