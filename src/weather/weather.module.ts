import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [HttpModule, ConfigModule, HistoryModule],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
