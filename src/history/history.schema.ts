import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class History extends Document {
  @Prop({ required: true })
  city!: string;

  @Prop({ type: Object, required: true })
  data!: any;
}

export const HistorySchema = SchemaFactory.createForClass(History);
