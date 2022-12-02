import gql from 'graphql-tag';

import { User } from 'city-os-common/libs/schema';

import { PermissionInput } from '../libs/schema';

export interface EditUserPayload {
  email: string;
  groupId: string;
  permissions: PermissionInput[];
}

export interface EditUserResponse {
  editUser: User;
}

export const EDIT_USER = gql`
  mutation editUser($email: String!, $groupId: ID!, $permissions: [PermissionInput]!) {
    editUser(email: $email, groupId: $groupId, permissions: $permissions) {
      email
      name
      phone
      status
      groups {
        group {
          id
          name
        }
        permission {
          rules {
            subject
            action
          }
        }
      }
    }
  }
`;
