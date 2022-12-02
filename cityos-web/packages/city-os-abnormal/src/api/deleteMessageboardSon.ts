import gql from 'graphql-tag';

export interface DeleteMessageboardSonPayload {
  id: string;
}

export interface DeleteMessageboardSonResponse {
  deleteMessageboardSon: boolean;
}

export const DELETE_MESSAGEBOARD_SON = gql`
  mutation deleteMessageboardSon($id: ID!) {
    deleteMessageboardSon(id: $id)
  }
`;
