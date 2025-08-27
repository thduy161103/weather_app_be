/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
import { WeatherService } from './weather.service';
import { HistoryService } from '../history/history.service';

@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly historyService: HistoryService,
  ) {}

  @Get('current')
  async getCurrent(@Query('city') city?: string) {
    const cityName = city?.trim() || 'Ho Chi Minh';
    console.log(
      `[WeatherController] Incoming current weather request for city=${cityName}`,
    );
    const result = await this.weatherService.getCurrentWeather(cityName);
    console.log('[WeatherController] Current weather response:', result);
    // Save to history
    await this.historyService.saveHistory(cityName, result);
    return result;
  }

  @Get('forecast')
  async getForecast(@Query('city') city?: string, @Query('days') days = '4') {
    const cityName = city?.trim() || 'Ho Chi Minh';
    console.log(
      `[WeatherController] Incoming forecast request for city=${cityName}, days=${days}`,
    );
    const d = parseInt(days, 10);
    const result = await this.weatherService.getForecast(
      cityName,
      isNaN(d) ? 4 : d,
    );
    console.log('[WeatherController] Forecast response:', result);
    // Save to history
    await this.historyService.saveHistory(cityName, result);
    return result;
  }
}
