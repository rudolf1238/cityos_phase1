import gql from 'graphql-tag';

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  forgotPassword: boolean;
}

export const FORGOT_PASSWORD = gql`
  mutation forgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;
