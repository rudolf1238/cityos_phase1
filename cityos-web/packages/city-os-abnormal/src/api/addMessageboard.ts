import gql from 'graphql-tag';

export interface AddMessageboardPayload {
  groupId?: string;
  MessageboardInput: MessageboardInput;
}

export interface AddMessageboardResponse {
  addMessageboard: boolean;
}

export interface MessageboardInput {
  deviceId: string | undefined;
  content: string;
  user: string | undefined;
  status: string | undefined;
  file: string | undefined;
}

export const ADD_MESSAGEBOARD = gql`
  mutation addMessageboard($groupId: ID!, $MessageboardInput: MessageboardInput!) {
    addMessageboard(groupId: $groupId, MessageboardInput: $MessageboardInput)
  }
`;
