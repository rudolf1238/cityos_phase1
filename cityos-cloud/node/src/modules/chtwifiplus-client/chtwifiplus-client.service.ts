import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ApolloError } from 'apollo-server-express';
import { ErrorCode } from 'src/models/error.code';
import FormData from 'form-data';
interface Err {
  code: string;
  status: string;
  message: string;
}
export interface AddCompanyReponse {
  code: string;
  status: string;
  area_owner: AddCompanyAreaOwner;
  message: string;
}
export interface AddCompanyAreaOwner {
  id: number;
  name: string;
  logo: string;
  line: string;
  url: string;
}
export interface EnterpriseSettingReponse {
  code: string;
  status: string;
  message: string;
  enterprise_setting: SetEnterpriseSetting;
}
interface SetEnterpriseSetting {
  ssid: string;
  service_introduction: string;
  service_introduction_en: string;
  access_time: number;
  daily_access: number;
  access_limit: number;
  idle_timeout: number;
  terms: string;
  terms_en: string;
  privacy_terms: string;
  privacy_terms_en: string;
  download_speed: number;
  upload_speed: number;
  pass_show_time: number;
}

interface DeleteCompanyReponse {
  code: string;
  status: string;
  message: string;
}

export interface Upload {
  code: string;
  status: string;
  message: string;
  name: string;
}
@Injectable()
export class ChtwifiplusClientService {
  private apiUrl: string;

  private apiKey: string;

  private readonly logger = new Logger(ChtwifiplusClientService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('WIFIPLUS_API_PATH');
    this.apiKey = this.configService.get<string>('WIFIPLUS_API_KEY');
  }

  async createAreaOwner(
    name: string,
    logo: string,
    line: string,
    url: string,
  ): Promise<AddCompanyReponse> {
    const data = {
      name: name,
      logo: logo,
      line: line,
      url: url,
    };
    //log
    this.logger.log(
      `CreateAreaOwner: ${this.apiUrl}/cms_api/${
        this.apiKey
      }/area_owners \n${JSON.stringify(data)}`,
    );

    const response = await this.httpService
      .post(`${this.apiUrl}/cms_api/${this.apiKey}/area_owners`, data)
      .toPromise()
      .then((res: AxiosResponse<AddCompanyReponse>) => res.data)
      .catch((error: AxiosError<Err>) => {
        if (error && error.response) {
          const errMessagedata = error.response.data;
          this.logger.error(
            `(Wifi Plus) Create area_owner - ${name} in WIFI PLUS failed with error = ${errMessagedata.message}.`,
          );
          const errMessage: AddCompanyReponse = {
            code: errMessagedata.code,
            status: errMessagedata.status,
            message: errMessagedata.message,
            area_owner: undefined,
          };
          return errMessage;
        } else {
          throw new ApolloError(
            `(Wifi Plus) Create area_owner - ${name} in WIFI PLUS failed with error = ${error.message}.`,
            ErrorCode.CHTWIFIPLUS_API_ERROR,
          );
        }
      });
    // if (response.status === 'Created') {
    //   return response.area_owner;
    // }
    return response;
  }

  async setEnterpriseSetting(
    companyId: number,
    ssid: string,
    serviceIntroduction: string,
    serviceIntroductionEn: string,
    accessTime: number,
    dailyAccess: number,
    accessLimit: number,
    idleTimeout: number,
    terms: string,
    termsEn: string,
    privacyTerms: string,
    privacyTermsEn: string,
    downloadSpeed: number,
    uploadSpeed: number,
    passShowTime: number,
  ): Promise<EnterpriseSettingReponse> {
    const data = {
      ssid: ssid,
      service_introduction: serviceIntroduction,
      service_introduction_en: serviceIntroductionEn,
      access_time: accessTime,
      daily_access: dailyAccess,
      access_limit: accessLimit,
      idle_timeout: idleTimeout,
      terms: terms,
      terms_en: termsEn,
      privacy_terms: privacyTerms,
      privacy_terms_en: privacyTermsEn,
      download_speed: downloadSpeed,
      upload_speed: uploadSpeed,
      pass_show_time: passShowTime,
    };
    //log
    this.logger.log(
      `SetEnterpriseSetting: ${this.apiUrl}/cms_api/${
        this.apiKey
      }/area_owners/${companyId.toString()} \n${JSON.stringify(
        data,
      )}/enterprise_setting`,
    );

    const response = await this.httpService
      .put(
        `${this.apiUrl}/cms_api/${this.apiKey}/area_owners/${companyId}/enterprise_setting`,
        data,
      )
      .toPromise()
      .then((res: AxiosResponse<EnterpriseSettingReponse>) => res.data)
      .catch((error: AxiosError<Err>) => {
        if (error && error.response) {
          const errMessagedata = error.response.data;
          this.logger.error(
            `(Wifi Plus) Set EnterpriseSetting area_ownerId - ${companyId} in the WIFI PLUS failed with error = ${errMessagedata.message}.`,
          );
          const errMessage: EnterpriseSettingReponse = {
            code: errMessagedata.code,
            status: errMessagedata.status,
            message: errMessagedata.message,
            enterprise_setting: undefined,
          };
          return errMessage;
        } else {
          throw new ApolloError(
            `(Wifi Plus) Set EnterpriseSetting area_ownerId - ${companyId} in the WIFI PLUS failed with error = ${error.message}.`,
            ErrorCode.CHTWIFIPLUS_API_ERROR,
          );
        }
      });
    // if (response.code === 200) {
    //   return response.enterprise_setting;
    // }
    return response;
  }

  async getAreaOwner(companyId: number): Promise<AddCompanyReponse> {
    //log
    this.logger.log(
      `GetAreaOwner: ${this.apiUrl}/cms_api/${this.apiKey}/area_owners/${companyId}`,
    );

    const response = await this.httpService
      .get(`${this.apiUrl}/cms_api/${this.apiKey}/area_owners/${companyId}`)
      .toPromise()
      .then((res: AxiosResponse<AddCompanyReponse>) => res.data)
      .catch((error: AxiosError<Err>) => {
        if (error && error.response) {
          const errMessagedata = error.response.data;
          this.logger.error(
            `(Wifi Plus) Get area_ownerId- ${companyId} in the WIFI PLUS failed with error = ${errMessagedata.message}.`,
          );
          const errMessage: AddCompanyReponse = {
            code: errMessagedata.code,
            status: errMessagedata.status,
            message: errMessagedata.message,
            area_owner: undefined,
          };
          return errMessage;
        } else {
          throw new ApolloError(
            `(Wifi Plus) Get area_ownerId- ${companyId} in the WIFI PLUS failed with error = ${error.message}.`,
            ErrorCode.CHTWIFIPLUS_API_ERROR,
          );
        }
      });
    return response;
  }

  async getEnterpriseSetting(
    companyId: number,
  ): Promise<EnterpriseSettingReponse> {
    //log
    this.logger.log(
      `getEnterpriseSetting: ${this.apiUrl}/cms_api/${this.apiKey}/area_owners/${companyId}/enterprise_setting`,
    );

    const response = await this.httpService
      .get(
        `${this.apiUrl}/cms_api/${this.apiKey}/area_owners/${companyId}/enterprise_setting`,
      )
      .toPromise()
      .then((res: AxiosResponse<EnterpriseSettingReponse>) => res.data)
      .catch((error: AxiosError<Err>) => {
        if (error && error.response) {
          const errMessagedata = error.response.data;
          this.logger.error(
            `(Wifi Plus) Get EnterpriseSetting area_ownerId - ${companyId} in the WIFI PLUS failed with error = ${errMessagedata.message}.`,
          );
          const errMessage: EnterpriseSettingReponse = {
            code: errMessagedata.code,
            status: errMessagedata.status,
            message: errMessagedata.message,
            enterprise_setting: undefined,
          };
          return errMessage;
        } else {
          throw new ApolloError(
            `(Wifi Plus) Get EnterpriseSetting area_ownerId - ${companyId} in the WIFI PLUS failed with error = ${error.message}.`,
            ErrorCode.CHTWIFIPLUS_API_ERROR,
          );
        }
      });
    return response;
  }

  async deleteAreaOwner(companyId: number): Promise<DeleteCompanyReponse> {
    //log
    this.logger.log(
      `DeleteAreaOwner: ${this.apiUrl}/cms_api/${this.apiKey}/area_owners/${companyId}`,
    );

    const response = await this.httpService
      .delete(`${this.apiUrl}/cms_api/${this.apiKey}/area_owners/${companyId}`)
      .toPromise()
      .then((res: AxiosResponse<DeleteCompanyReponse>) => res.data)
      .catch((error: AxiosError<Err>) => {
        if (error && error.response) {
          const errMessagedata = error.response.data;
          this.logger.error(
            `(Wifi Plus) Delete area_ownerId- ${companyId} in the WIFI PLUS failed with error = ${errMessagedata.message}.`,
          );
          const errMessage: DeleteCompanyReponse = {
            code: errMessagedata.code,
            status: errMessagedata.status,
            message: errMessagedata.message,
          };
          return errMessage;
        }
        throw new ApolloError(
          `(Wifi Plus) Delete area_ownerId- ${companyId} in the WIFI PLUS failed with error = ${error.message}.`,
          ErrorCode.CHTWIFIPLUS_API_ERROR,
        );
      });
    return response;
  }

  async updateAreaOwner(
    companyId: string,
    name: string,
    logo: string,
    line: string,
    url: string,
  ): Promise<AddCompanyReponse> {
    const data = {
      name: name,
      logo: logo,
      line: line,
      url: url,
    };
    //log
    this.logger.log(
      `UpdateAreaOwner: ${this.apiUrl}/cms_api/${
        this.apiKey
      }/area_owners/${companyId} \n${JSON.stringify(data)}`,
    );

    const response = await this.httpService
      .put(
        `${this.apiUrl}/cms_api/${this.apiKey}/area_owners/${companyId}`,
        data,
      )
      .toPromise()
      .then((res: AxiosResponse<AddCompanyReponse>) => res.data)
      .catch((error: AxiosError<Err>) => {
        if (error && error.response) {
          const errMessagedata = error.response.data;

          this.logger.error(
            `Update area_ownerId- ${companyId} in the WIFI PLUS failed with error = ${errMessagedata.message}.`,
          );
          const errMessage: AddCompanyReponse = {
            code: errMessagedata.code,
            status: errMessagedata.status,
            message: errMessagedata.message,
            area_owner: undefined,
          };
          return errMessage;
        }
        throw new ApolloError(
          `Update area_ownerId- ${companyId} in the WIFI PLUS failed with error = ${error.message}.`,
          ErrorCode.CHTWIFIPLUS_API_ERROR,
        );
      });
    // if (response.code === 200) {
    //   return response.area_owner;
    // }
    return response;
  }

  async uploadFile(file: Express.Multer.File): Promise<Upload> {
    //log
    this.logger.log(`uploads: ${this.apiUrl}/cms_api/${this.apiKey}/uploads`);
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
    });

    const response = await this.httpService
      .post(`${this.apiUrl}/cms_api/${this.apiKey}/uploads`, formData, {
        headers: formData.getHeaders(),
      })
      //.pipe(map((resp) => resp.data))
      .toPromise()
      .then((res: AxiosResponse<Upload>) => res.data)
      .catch((error: AxiosError<Err>) => {
        if (error && error.response) {
          const errMessagedata = error.response.data;
          this.logger.error(
            `(Wifi Plus) uploadFile- in the WIFI PLUS failed with error = ${errMessagedata.message}.`,
          );
          const errMessage: Upload = {
            code: errMessagedata.code,
            status: errMessagedata.status,
            message: errMessagedata.message,
            name: '',
          };
          return errMessage;
        }
        throw new ApolloError(
          `(Wifi Plus) uploadFile in the WIFI PLUS failed with error = ${error.message}.`,
          ErrorCode.CHTWIFIPLUS_API_ERROR,
        );
      });
    return response;
  }
}
