import { Document, Types } from 'mongoose';
import { RuleAutomation } from './rule.automation';
import {
  DeviceAction,
  DeviceActionSchema,
  NotifyAction,
  NotifyActionSchema,
} from './automation.action';
import { RuleAuditLog as ApolloRuleAuditLog } from 'src/graphql.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class RuleAuditLog {
  _id: Types.ObjectId;

  id: string;

  @Prop({ type: Types.ObjectId, ref: RuleAutomation.name, autopopulate: true })
  rule: RuleAutomation;

  @Prop()
  triggeredTime: Date;

  @Prop()
  triggeredExpression: string;

  @Prop()
  triggeredCurrentValue: string;

  @Prop({ type: [NotifyActionSchema], _id: false })
  notifyActions: NotifyAction[] = [];

  @Prop({ type: [DeviceActionSchema], _id: false })
  deviceActions: DeviceAction[] = [];

  toApolloRuleAuditLog: () => ApolloRuleAuditLog;
}

export type RuleAuditLogDocument = RuleAuditLog & Document;
export const RuleAuditLogSchema = SchemaFactory.createForClass(RuleAuditLog);

RuleAuditLogSchema.methods.toApolloRuleAuditLog = function (
  this: RuleAuditLog,
): ApolloRuleAuditLog {
  const apolloRuleAuditLog = new ApolloRuleAuditLog();
  apolloRuleAuditLog.rule = this.rule.toApolloRuleAutomation();
  apolloRuleAuditLog.triggeredTime = this.triggeredTime;
  apolloRuleAuditLog.triggeredExpression = this.triggeredExpression;
  apolloRuleAuditLog.triggeredCurrentValue = this.triggeredCurrentValue;
  apolloRuleAuditLog.notifyActions = this.notifyActions?.map((it) =>
    it.toApolloNotifyAction(),
  );
  apolloRuleAuditLog.deviceActions = this.deviceActions?.map((it) =>
    it.toApolloDeviceAction(),
  );
  return apolloRuleAuditLog;
};
