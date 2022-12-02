import gql from 'graphql-tag';

interface ResetPasswordInput {
  accessCode: string;
  password: string;
}

export interface ResetPasswordPayload {
  resetPasswordInput: ResetPasswordInput;
}

export interface ResetPasswordResponse {
  resetPassword: boolean;
}

export const RESET_PASSWORD = gql`
  mutation resetPassword($resetPasswordInput: ResetPasswordInput!) {
    resetPassword(resetPasswordInput: $resetPasswordInput)
  }
`;
