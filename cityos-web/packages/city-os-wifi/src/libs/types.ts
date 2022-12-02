import { ICompany } from './schema';

export type PartialCompany = Pick<
  ICompany,
 'companyId' | 'id' | 'name' | 'logo' | 'line' | 'url'
>;

export type CompanyBasic = Pick<
  ICompany,
 'companyId' | 'id' | 'name' | 'logo' | 'line' | 'url'
>

export type CompanyAdvance = Omit<ICompany, 'companyId' | 'id' | 'name' | 'logo' | 'line' | 'url'>;

export interface DetailFormData extends CompanyBasic, CompanyAdvance{
  groupId: string;
  //companyBasic: CompanyBasic;
  //companyAdvance: CompanyAdvance;
}

export interface FormData extends ICompany{
  //groupId: string;
  //companyBasic: CompanyBasic;
  //companyAdvance: CompanyAdvance;
}


