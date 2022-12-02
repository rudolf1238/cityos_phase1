import gql from 'graphql-tag';

export interface DeleteGroupPayload {
  groupId: string;
}

export interface DeleteGroupResponse {
  deleteGroup: boolean;
}

export const DELETE_GROUP = gql`
  mutation deleteGroup($groupId: ID!) {
    deleteGroup(groupId: $groupId)
  }
`;
