import gql from 'graphql-tag';
//import {FormData} from '../libs/types';

export interface EditCompanyPayload{
  groupId: string,
  divisionId: string,
  name: string,
  logo?: string | null,
  url?:string | null, 
  line?:string, 
  ssid:string,
  serviceIntroduction:string,
  serviceIntroductionEn:string, 
  accessTime:number,
  dailyAccess:number,
  accessLimit:number,
  idleTimeout:number,
  terms:string,
  termsEn:string,
  privacyTermsEn:string,
  privacyTerms:string,
  downloadSpeed:number,
  uploadSpeed:number,
  passShowTime:number,    
};
export interface EditCompanyResponse {
  editCompanyResult: string;

}

export const EDIT_COMPANY = gql`
mutation editCompany($groupId: ID!, $divisionId: ID!, $name: String!, $logo: String!, $url:String! , $line:String! ,
  $ssid:String! , $serviceIntroduction: String!, $serviceIntroductionEn:String!,$accessTime: Int, $dailyAccess:Int,
  $accessLimit:Int, $idleTimeout:Int, $terms:String, $termsEn:String, $privacyTerms:String, $privacyTermsEn:String,
  $downloadSpeed:Int,$uploadSpeed:Int, $passShowTime:Int) 
 {
  editCompany(groupId: $groupId, divisionId: $divisionId, name: $name,  logo: $logo, url:$url , line:$line
    ssid:$ssid, serviceIntroduction:$serviceIntroduction, serviceIntroductionEn: $serviceIntroductionEn, accessTime:$accessTime, 
    dailyAccess: $dailyAccess,accessLimit:$accessLimit, idleTimeout:$idleTimeout, terms:$terms, termsEn:$termsEn, 
    privacyTerms:$privacyTerms, privacyTermsEn:$privacyTermsEn, downloadSpeed:$downloadSpeed, uploadSpeed:$uploadSpeed, 
    passShowTime:$passShowTime)
 }
`;
