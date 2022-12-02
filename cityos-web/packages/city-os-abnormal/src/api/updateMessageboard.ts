import gql from 'graphql-tag';

export interface UpdateMessageboardPayload {
  groupId?: string;
  UpdateMessageboardInput: UpdateMessageboardInput;
}

export interface UpdateMessageboardResponse {
  updateMessageboard: boolean;
}

export interface UpdateMessageboardInput {
  id: string;
  deviceId: string | undefined;
  content: string;
  user: string | undefined;
  status: string | undefined;
  file: string | undefined;
}

export const UPDATE_MESSAGEBOARD = gql`
  mutation updateMessageboard($groupId: ID!, $UpdateMessageboardInput: UpdateMessageboardInput!) {
    updateMessageboard(groupId: $groupId, UpdateMessageboardInput: $UpdateMessageboardInput)
  }
`;
