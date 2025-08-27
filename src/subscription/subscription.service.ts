/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { Subscription } from './subscription.schema';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name) private subModel: Model<Subscription>,
    private configService: ConfigService,
    private weatherService: WeatherService,
  ) {
    // start manual scheduler: send weather emails every minute
    if (process.env.NODE_ENV !== 'test') {
      setInterval(() => {
        // fire and forget, catch errors
        void this.sendWeatherEmails().catch((err) =>
          console.error('Interval send error', err),
        );
      }, 60000);
    }
  }

  async register(email: string, city: string): Promise<Subscription> {
    const token = uuidv4();
    // upsert subscription record with city; auto-confirm for non-production
    const confirmFlag = process.env.NODE_ENV === 'production' ? false : true;
    const result = await this.subModel.findOneAndUpdate(
      { email },
      { email, city, token, isConfirmed: confirmFlag },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    // send confirmation email
    try {
      await this.sendConfirmationEmail(email, token);
    } catch (err) {
      console.error('[SubscriptionService] sendConfirmationEmail error:', err);
    }
    return result;
  }

  /**
   * Send subscription confirmation email with token link
   */
  private async sendConfirmationEmail(email: string, token: string) {
    // Create SMTP transporter using real email settings
    const transporter = createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE') ?? false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const confirmLink = `${backendUrl}/subscription/confirm?token=${token}`;
    const info = await transporter.sendMail({
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Please confirm your subscription',
      html: `<p>Click <a href="${confirmLink}">here</a> to confirm your subscription.</p>`,
    });
    console.log(
      `[SubscriptionService] Confirmation email sent: ${info.messageId}`,
    );
  }

  async confirm(token: string): Promise<Subscription> {
    const sub = await this.subModel.findOne({ token });
    if (!sub) {
      throw new NotFoundException('Subscription token not found');
    }
    sub.isConfirmed = true;
    await sub.save();
    return sub;
  }

  async unsubscribe(email: string): Promise<void> {
    const res = await this.subModel.findOneAndDelete({ email });
    if (!res) {
      throw new NotFoundException('Email not subscribed');
    }
  }

  private async sendWeatherEmails() {
    const subs = await this.subModel.find({ isConfirmed: true }).exec();
    for (const sub of subs) {
      try {
        const weather = await this.weatherService.getCurrentWeather(sub.city);
        // Create transporter with real SMTP settings
        const transporter = createTransport({
          host: this.configService.get<string>('EMAIL_HOST'),
          port: this.configService.get<number>('EMAIL_PORT'),
          secure: this.configService.get<boolean>('EMAIL_SECURE') ?? false,
          auth: {
            user: this.configService.get<string>('EMAIL_USER'),
            pass: this.configService.get<string>('EMAIL_PASS'),
          },
        });
        const html = `<p>${sub.city}: ${weather.current.temp_c}°C - ${weather.current.condition.text}</p>`;
        const info = await transporter.sendMail({
          from: this.configService.get<string>('EMAIL_USER'),
          to: sub.email,
          subject: `Subscription Test: ${sub.city}`,
          html,
        });
        console.log(
          `[SubscriptionService] Test email sent to ${sub.email}: ${info.messageId}`,
        );
      } catch (err) {
        console.error(
          `[SubscriptionService] sendTestEmails error for ${sub.email}:`,
          err,
        );
      }
    }
  }
}
