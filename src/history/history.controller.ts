import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  async save(@Body('city') city: string, @Body('data') data: any) {
    return this.historyService.saveHistory(city, data);
  }

  @Get()
  async find(@Query('city') city: string) {
    return this.historyService.getHistory(city);
  }
}
