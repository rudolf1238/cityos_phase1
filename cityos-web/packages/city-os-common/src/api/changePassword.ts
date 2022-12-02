import gql from 'graphql-tag';

interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  changePasswordInput: ChangePasswordInput;
}

export interface ChangePasswordResponse {
  changePassword: boolean;
}

export const CHANGE_PASSWORD = gql`
  mutation changePassword($changePasswordInput: ChangePasswordInput!) {
    changePassword(changePasswordInput: $changePasswordInput)
  }
`;
