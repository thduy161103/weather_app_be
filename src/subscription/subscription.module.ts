import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from '../weather/weather.module';

import { Subscription, SubscriptionSchema } from './subscription.schema';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
// scheduling temporarily removed

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    WeatherModule,
  ],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
