export enum SortOrder {
    ASCENDING = 'ASCENDING',
    DESCENDING = 'DESCENDING',
  }

export enum AreaSortField {
    NAME = 'NAME',
    COMPANY = 'COMPANY',
  }
  export interface AreaFilter {
    keyword?: string;
    areaSortField?: AreaSortField;
    sortOrder?: SortOrder;
  }
  
  export interface IArea {
    areaId: string;
    name: string;
    groups: string;
    // desc?: string | null;
  }
  export interface ICompany {
    id: string;
    companyId?: string | null;
    name: string;
    logo?: string;
    line?: string;
    url?: string;

    ssid: string;
    serviceIntroduction : string;
    serviceIntroductionEn : string;
    accessTime: number;
    dailyAccess: number;
    accessLimit : number;
    idleTimeout :number;
    terms : string;
    termsEn : string;
    privacyTerms : string;
    privacyTermsEn : string;
    downloadSpeed : number;
    uploadSpeed : number;
    passShowTime : number;
  }
  
  export interface WifiFilter {
    keyword?: string;
    sortField?: WifiSortField;
    sortOrder?: SortOrder;
  }
  
  export enum WifiSortField {
    ID = 'ID',
    COMPANYID = 'COMPANYID',
    NAME = 'NAME',
  }
  