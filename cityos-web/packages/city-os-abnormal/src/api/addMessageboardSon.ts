import gql from 'graphql-tag';

export interface AddMessageboardSonPayload {
  groupId?: string;
  MessageboardInputSon: MessageboardInputSon;
}

export interface AddMessageboardSonResponse {
  addMessageboardSon: boolean;
}

export interface MessageboardInputSon {
  deviceId: string | undefined;
  msgId: string;
  content: string;
  user: string | undefined;
  status: string;
  file: string | undefined;
}

export const ADD_MESSAGEBOARD_SON = gql`
  mutation addMessageboardSon($groupId: ID!, $MessageboardInputSon: MessageboardInputSon!) {
    addMessageboardSon(groupId: $groupId, MessageboardInputSon: $MessageboardInputSon)
  }
`;
