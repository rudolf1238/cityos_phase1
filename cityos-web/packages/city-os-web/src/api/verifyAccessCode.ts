import gql from 'graphql-tag';

export interface VerifyAccessCodePayload {
  accessCode: string;
}

export interface VerifyAccessCodeResponse {
  verifyAccessCode: boolean;
}

export const VERIFY_ACCESS_CODE = gql`
  mutation verifyAccessCode($accessCode: String!) {
    verifyAccessCode(accessCode: $accessCode)
  }
`;
