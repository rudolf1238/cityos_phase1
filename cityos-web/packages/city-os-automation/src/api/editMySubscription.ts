import gql from 'graphql-tag';

import { RuleSubscription } from '../libs/type';

export interface EditMySubscriptionPayload {
  ruleId: string;
  byLine: boolean;
  byMail: boolean;
}

export interface EditMySubscriptionResponse {
  editMySubscription: RuleSubscription;
}

export const EDIT_MY_SUBSCRIPTION = gql`
  mutation editMySubscription($ruleId: ID!, $byLine: Boolean!, $byMail: Boolean!) {
    editMySubscription(ruleId: $ruleId, byLine: $byLine, byMail: $byMail) {
      rule {
        id
      }
      byLine
      byMail
    }
  }
`;
