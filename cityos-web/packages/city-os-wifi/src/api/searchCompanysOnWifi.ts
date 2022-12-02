import gql from 'graphql-tag';

import { WifiFilter } from '../libs/schema';
import { PartialCompany } from '../libs/types';


export interface SearchCompanysPayload {
    groupId: string;
    email: string;
    filter?: WifiFilter;
    currentPage?: number;
    pageCount?: number;
  }
  
  export interface SearchCompanysResponse {
    searchCompanys: {
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;      
        endCursor : string;
      };
      divisions: {
        node: PartialCompany;
      }[];
    };
  }
  
  export const SEARCH_COMPANYS_ON_WIFI = gql`
    query searchCompanysOnWifi($groupId: ID!, $email: String, $filter: WifiFilter, $currentPage: Int, $pageCount: Int) {
      searchCompanys(groupId: $groupId, email: $email, filter : $filter , currentPage: $currentPage, pageCount: $pageCount) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        divisions {
          node {
            id
            companyId
            name    
            logo
            url
            line           
          }
        }
      }
    }
  `;
  