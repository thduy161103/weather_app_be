import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { History, HistorySchema } from './history.schema';
import { HistoryService } from './history.service.js';
import { HistoryController } from './history.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: History.name, schema: HistorySchema }]),
  ],
  providers: [HistoryService],
  controllers: [HistoryController],
  exports: [HistoryService],
})
export class HistoryModule {}
