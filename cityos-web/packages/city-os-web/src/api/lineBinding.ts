import gql from 'graphql-tag';

export interface LineBindingPayload {
  email: string;
  password: string;
}

export interface LineBindingResponse {
  lineBinding: {
    nonce: string;
  };
}

export const LINE_BINDING = gql`
  mutation lineBinding($email: String!, $password: String!) {
    lineBinding(email: $email, password: $password) {
      nonce
    }
  }
`;
