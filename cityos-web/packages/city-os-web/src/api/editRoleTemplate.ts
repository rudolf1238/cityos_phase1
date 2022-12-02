import gql from 'graphql-tag';

import { PermissionInput, RoleTemplate } from '../libs/schema';

export interface EditRoleTemplatePayload {
  templateId: string;
  name?: string | null;
  permissionInputs?: PermissionInput[] | null;
}

export interface EditRoleTemplateResponse {
  editRoleTemplate: RoleTemplate;
}

export const EDIT_ROLE_TEMPLATE = gql`
  mutation editRoleTemplate(
    $templateId: ID!
    $name: String
    $permissionInputs: [PermissionInput!]
  ) {
    editRoleTemplate(templateId: $templateId, name: $name, permissionInputs: $permissionInputs) {
      id
      name
      permission {
        rules {
          subject
          action
        }
      }
    }
  }
`;
