import gql from 'graphql-tag';

export interface DeleteMessageboardPayload {
  id: string;
}

export interface DeleteMessageboardResponse {
  deleteMessageboard: boolean;
}

export const DELETE_MESSAGEBOARD = gql`
  mutation deleteMessageboard($id: ID!) {
    deleteMessageboard(id: $id)
  }
`;
