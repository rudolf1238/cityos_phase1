import gql from 'graphql-tag';


import { CompanyAdvance } from '../libs/types';


export interface SearchCompanyAdvancePayload {
    groupId?: string;
    companyId?: string ;
   
  }
  
  export interface SearchCompanyAdvanceResponse {
    searchCompanyAdvance: {
        node: CompanyAdvance;
    };
  }
  
  export const SEARCH_COMPANYADVANCE_ON_WIFI = gql`
    query searchCompanyAdvanceOnWifi($groupId: ID!, $companyId: String) {
      searchCompanyAdvance(groupId: $groupId, companyId: $companyId) {        
          node {
            ssid
            serviceIntroduction
            serviceIntroductionEn    
            accessTime
            dailyAccess
            accessLimit
            idleTimeout
            terms
            termsEn
            privacyTerms
            privacyTermsEn
            downloadSpeed
            uploadSpeed
            passShowTime
          }   
      }
    }
  `;
  