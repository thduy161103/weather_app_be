/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subService: SubscriptionService) {}

  @Post('register')
  register(@Body() body: { email?: string; city?: string }) {
    const { email, city } = body;
    if (!email || !city) {
      throw new BadRequestException('Email and city are required');
    }
    console.log(
      `[SubscriptionController] Register request for email=${email}, city=${city}`,
    );
    // Fire-and-forget registration, errors logged in service
    this.subService
      .register(email, city)
      .catch((err) =>
        console.error('[SubscriptionController] Registration error:', err),
      );
    return { message: 'Registration request processed. Check your email.' };
  }

  @Get('confirm')
  async confirm(@Query('token') token: string) {
    console.log(`[SubscriptionController] Confirm request token=${token}`);
    return this.subService.confirm(token);
  }

  @Post('unsubscribe')
  async unsubscribe(@Body('email') email: string) {
    console.log(
      `[SubscriptionController] Unsubscribe request for email=${email}`,
    );
    await this.subService.unsubscribe(email);
    return { message: 'Unsubscribed successfully' };
  }
}
