import { Types, Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Int32 } from 'mongodb';

@Schema({ timestamps: true })
export class EsignageScheduleLogs {
  _id!: Types.ObjectId;

  id: string;

  @Prop()
  logId: Types.ObjectId;

  @Prop()
  scheduleId: Types.ObjectId;

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
export type EsignageScheduleLogsDocument = EsignageScheduleLogs & Document;
export const EsignageScheduleLogsSchema =
  SchemaFactory.createForClass(EsignageScheduleLogs);
