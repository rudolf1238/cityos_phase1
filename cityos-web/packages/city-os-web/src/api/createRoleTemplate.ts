import gql from 'graphql-tag';

import { PermissionInput, RoleTemplate } from '../libs/schema';

export interface CreateRoleTemplatePayload {
  name: string;
  permissionInputs: PermissionInput[];
}

export interface CreateRoleTemplateResponse {
  createRoleTemplate: RoleTemplate;
}

export const CREATE_ROLE_TEMPLATE = gql`
  mutation createRoleTemplate($name: String!, $permissionInputs: [PermissionInput!]!) {
    createRoleTemplate(name: $name, permissionInputs: $permissionInputs) {
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
