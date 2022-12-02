import gql from 'graphql-tag';

import { SensorMask } from 'city-os-common/libs/schema';

export interface EditGroupInput {
  name?: string | null;
  sensorMaskInput: SensorMask;
}

export interface EditGroupPayload {
  groupId: string;
  editGroupInput: EditGroupInput;
}

export interface EditGroupResponse {
  editGroup: boolean;
}

export const EDIT_GROUP = gql`
  mutation editGroup($groupId: ID!, $editGroupInput: EditGroupInput!) {
    editGroup(groupId: $groupId, editGroupInput: $editGroupInput)
  }
`;
