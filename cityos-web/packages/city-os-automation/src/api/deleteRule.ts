import gql from 'graphql-tag';

export interface DeleteRulePayload {
  ruleId: string;
}

export interface DeleteRuleResponse {
  deleteRule: boolean;
}

export const DELETE_RULE = gql`
  mutation deleteRule($ruleId: ID!) {
    deleteRule(ruleId: $ruleId)
  }
`;
