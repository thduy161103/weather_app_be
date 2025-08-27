import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  token!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ default: false })
  isConfirmed!: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
