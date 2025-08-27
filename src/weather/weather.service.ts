/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unused-vars */
import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  private apiKey: string;
  private baseUrl: string = 'http://api.weatherapi.com/v1';

  constructor(
    private http: HttpService,
    private config: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.apiKey = this.config.get<string>('WEATHER_API_KEY')!;
  }

  async getCurrentWeather(city: string) {
    const cacheKey = `weather:current:${city}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(city)}`;
    try {
      const response = await firstValueFrom(this.http.get(url));
      const data = response.data;
      await this.cacheManager.set(cacheKey, data, 600); // cache for 10 minutes
      return data;
    } catch {
      throw new HttpException(
        'Failed to fetch current weather',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getForecast(city: string, days: number) {
    const cacheKey = `weather:forecast:${city}:${days}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    const url = `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(city)}&days=${days}`;
    try {
      const response = await firstValueFrom(this.http.get(url));
      const data = response.data;
      await this.cacheManager.set(cacheKey, data, 1800); // cache for 30 minutes
      return data;
    } catch (_err) {
      throw new HttpException(
        'Failed to fetch weather forecast',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
