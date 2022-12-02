import gql from 'graphql-tag';

export interface DeleteRoleTemplatePayload {
  templateId: string;
}

export interface DeleteRoleTemplateResponse {
  deleteRoleTemplate: boolean;
}

export const DELETE_ROLE_TEMPLATE = gql`
  mutation deleteRoleTemplate($templateId: ID!) {
    deleteRoleTemplate(templateId: $templateId)
  }
`;
