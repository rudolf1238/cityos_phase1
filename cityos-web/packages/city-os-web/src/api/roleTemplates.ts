import gql from 'graphql-tag';

import { RoleTemplate } from '../libs/schema';

export interface RoleTemplatesResponse {
  roleTemplates: RoleTemplate[] | null;
}

export const ROLE_TEMPLATES = gql`
  query roleTemplates {
    roleTemplates {
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
