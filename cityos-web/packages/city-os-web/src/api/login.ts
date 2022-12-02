import gql from 'graphql-tag';

export interface LoginPayload {
  loginInput: {
    email: string;
    password: string;
  };
}

export interface LoginResponse {
  login: {
    refreshToken: string;
  };
}

export const LOGIN = gql`
  mutation login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      refreshToken
    }
  }
`;
