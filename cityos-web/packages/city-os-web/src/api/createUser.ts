import gql from 'graphql-tag';

import { Language } from 'city-os-common/libs/schema';

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  phone: string;
  accessCode: string;
  language: Language;
}

interface CreateUserOutput {
  refreshToken: string;
  refreshTokenExpiresAt: number;
  deviceToken: string;
}

export interface CreateUserPayload {
  createUserInput: CreateUserInput;
}

export interface CreateUserResponse {
  createUser: CreateUserOutput;
}

export const CREATE_USER = gql`
  mutation createUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      refreshToken
      refreshTokenExpiresAt
      deviceToken
    }
  }
`;
