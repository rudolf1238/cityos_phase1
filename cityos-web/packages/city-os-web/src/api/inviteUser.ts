import gql from 'graphql-tag';

import { User } from 'city-os-common/libs/schema';

import { PermissionInput } from '../libs/schema';

export interface InviteUserPayload {
  inviteUserInput: {
    email: string;
    groupId: string;
    permissions?: PermissionInput[] | null;
  };
}

export interface InviteUserResponse {
  inviteUser: Omit<User, 'language'>;
}

export const INVITE_USER = gql`
  mutation inviteUser($inviteUserInput: InviteUserInput!) {
    inviteUser(inviteUserInput: $inviteUserInput) {
      email
      name
      phone
      status
      groups {
        group {
          id
          name
        }
      }
    }
  }
`;
