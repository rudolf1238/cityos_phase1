import gql from 'graphql-tag';

import { Language, Theme, User } from '../libs/schema';

interface UpdateProfileInput {
  name?: string | null;
  phone?: string | null;
  language?: Language | null;
  theme?: Theme | null;
}

export interface UpdateProfilePayload {
  updateProfileInput: UpdateProfileInput;
}

export interface UpdateProfileResponse {
  updateProfile: User;
}

export const UPDATE_PROFILE = gql`
  mutation updateProfile($updateProfileInput: UpdateProfileInput!) {
    updateProfile(updateProfileInput: $updateProfileInput) {
      email
      name
      phone
      status
      language
      theme
      groups {
        group {
          id
          name
          projectKey
          subGroups
        }
        permission {
          rules {
            action
            subject
          }
        }
      }
    }
  }
`;
