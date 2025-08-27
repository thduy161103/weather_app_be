import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History } from './history.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name) private historyModel: Model<History>,
  ) {}

  async saveHistory(city: string, data: any): Promise<History> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const record = await this.historyModel.findOneAndUpdate(
      { city, createdAt: { $gte: startOfDay } },
      { city, data },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return record;
  }

  async getHistory(city: string): Promise<History[]> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    return this.historyModel
      .find({ city, createdAt: { $gte: startOfDay } })
      .sort({ createdAt: -1 })
      .exec();
  }
}
