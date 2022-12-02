import gql from 'graphql-tag';

interface ContactUsInput {
  organization?: string | null;
  name: string;
  phone?: string | null;
  email: string;
  message: string;
}

export interface ContactUsPayload {
  contactUsInput: ContactUsInput;
}

export interface ContactUsResponse {
  contactUs: boolean;
}

export const CONTACT_US = gql`
  mutation contactUs($contactUsInput: ContactUsInput!) {
    contactUs(contactUsInput: $contactUsInput)
  }
`;
