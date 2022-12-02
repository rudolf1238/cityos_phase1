import gql from 'graphql-tag';

export interface UpdateMessageboardSonPayload {
  groupId?: string;
  UpdateMessageboardSonInput: UpdateMessageboardSonInput;
}

export interface UpdateMessageboardSonResponse {
  updateMessageboardSon: boolean;
}

export interface UpdateMessageboardSonInput {
  id: string;
  deviceId: string | undefined;
  content: string;
  user: string | undefined;
  status: string | undefined;
  file: string | undefined;
}

export const UPDATE_MESSAGEBOARD_SON = gql`
  mutation updateMessageboardSon(
    $groupId: ID!
    $UpdateMessageboardSonInput: UpdateMessageboardSonInput!
  ) {
    updateMessageboardSon(
      groupId: $groupId
      UpdateMessageboardSonInput: $UpdateMessageboardSonInput
    )
  }
`;
