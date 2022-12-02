import gql from 'graphql-tag';

interface CreateGroupInput {
  parentGroupId: string;
  name: string;
}

export interface CreateGroupPayload {
  createGroupInput: CreateGroupInput;
}

export interface CreateGroupResponse {
  createGroup: boolean;
}

export const CREATE_GROUP = gql`
  mutation createGroup($createGroupInput: CreateGroupInput!) {
    createGroup(createGroupInput: $createGroupInput)
  }
`;
