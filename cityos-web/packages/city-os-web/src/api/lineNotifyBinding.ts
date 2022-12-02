import gql from 'graphql-tag';

export interface LineNotifyBindingPayload {
  code: string;
  state: string;
}

export interface LineNotifyBindingResponse {
  lineNotifyBinding: boolean | null;
}

export const LINE_NOTIFY_BINDING = gql`
  mutation lineNotifyBinding($code: String!, $state: String!) {
    lineNotifyBinding(code: $code, state: $state)
  }
`;
