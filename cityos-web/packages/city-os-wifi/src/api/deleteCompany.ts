import gql from 'graphql-tag';

export interface DeleteCompanyPayload {
  groupId: string;
  divisionId: string;
}

export interface DeleteCompanyResponse {
  deleteCompany: string[];
}

// delete_company just remove company_id in groups collection
export const DELETE_COMPANY = gql`
  mutation deleteCompany($groupId: ID!, $divisionId: ID!) {
    deleteCompany(groupId: $groupId, divisionId: $divisionId)
  }
`;
