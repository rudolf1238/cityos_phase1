import { Types, Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Int32 } from 'mongodb';

@Schema({ timestamps: true })
export class EsignageSchedule {
  _id!: Types.ObjectId;

  id: string;

  @Prop()
  templateId: Types.ObjectId;

  @Prop()
  scheduleName: string;

  @Prop()
  playStartDate: Date;

  @Prop()
  playEndDate: Date;

  @Prop()
  playStartTime: string;

  @Prop()
  playEndTime: string;

  @Prop()
  loopMode: string;

  @Prop()
  dailyFrequency: Int32;

  @Prop()
  weeklyFrequency: string[];

  @Prop()
  monthlyFrequency_Month: string[];

  @Prop()
  monthlyFrequency_Day: string[];

  @Prop()
  audioSetting: Int32;

  @Prop()
  downloadDirectly: boolean;

  @Prop()
  scheduledDownloadTime: Date;
}
export type EsignageScheduleDocument = EsignageSchedule & Document;
export const EsignageScheduleSchema =
  SchemaFactory.createForClass(EsignageSchedule);
