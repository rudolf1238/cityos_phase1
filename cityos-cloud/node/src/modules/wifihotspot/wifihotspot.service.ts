import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import {
  ResponseWIFI,
  Group,
  Detaildivision,
  PageInfo,
  WifiFilter,
  DetailCompanyAdvance,
  CompanyAdvance,
} from 'src/graphql.schema';
import { InjectModel } from '@nestjs/mongoose';
// import { Types } from 'mongoose';
import { ApolloError } from 'apollo-server-express';
import { Group as GroupModel } from 'src/models/group';
import { ConfigService } from '@nestjs/config';
import { ChtwifiplusClientService } from '../chtwifiplus-client/chtwifiplus-client.service';
import { WifihotspotRepository, DivisionCount } from './wifihotspot.repository';
import { Model } from 'mongoose';
//import {EnterpriseSettingReponse}from '../chtwifiplus-client/chtwifiplus-client.service';
@Injectable()
export class WifihotspotService {
  private readonly logger = new Logger(WifihotspotService.name);

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private chtwifiplusClientService: ChtwifiplusClientService,
    // @InjectModel(User)
    // private readonly userModel: ReturnModelType<typeof User>,
    @InjectModel(GroupModel.name)
    private readonly groupModel: Model<GroupModel>,
    private wifihotspotRepository: WifihotspotRepository,
  ) {}

  async getDivisionwithUser(
    groupId: string,
    email: string,
    currentPage: number,
    pageCount: number,
    filter?: WifiFilter,
  ): Promise<ResponseWIFI> {
    const user = await this.userService.findUser(email);
    if (user && user.id) {
      const divisions: Group[] =
        await this.wifihotspotRepository.getDivisionwithUser(
          groupId,
          user.id,
          currentPage,
          pageCount,
          filter,
        );

      const divisionCount: DivisionCount[] =
        await this.wifihotspotRepository.getDivisionCount(
          groupId,
          user.id,
          filter,
        );

      const grouplist: Group[] = divisions;
      const response = new ResponseWIFI();

      const division = grouplist.map((group) => {
        const nodes = new Detaildivision();
        nodes.node = group;
        return nodes;
      });
      response.divisions = division;
      response.totalCount =
        divisionCount.length !== 0 && divisionCount[0]
          ? divisionCount[0].divisionCount
          : 0;
      const pageInfo = new PageInfo();
      pageInfo.hasPreviousPage = !(currentPage === 1);
      pageInfo.hasNextPage = currentPage * pageCount < response.totalCount;
      pageInfo.beforeCursor = division[0] ? division[0].node.id : undefined;
      pageInfo.endCursor =
        division && division[0]
          ? division[division.length - 1].node.id
          : undefined;
      response.pageInfo = pageInfo;
      return response;
    } else {
      throw new ApolloError(
        `Cannot find - ${email} in the users collection.`,
        '400',
      );
    }
    // const divisionid: Group[] = [];
    // for (const group of user.groups) {
    //   const device = await this.deviceModel
    //     .find({ groups: group.group.id, type: 'WIFI' })
    //     .populate({ path: 'groups', model: Group })
    //     .populate({ path: 'sensors', model: Sensor });
    //   if (device.length > 0) {
    //     divisionid.push(group.group.toApolloGroup());
    //   }
    // }
    // divisionid.sort();
  }

  async searchCompanyAdvance(companyId: string): Promise<DetailCompanyAdvance> {
    const getEnterprise =
      await this.chtwifiplusClientService.getEnterpriseSetting(
        parseInt(companyId),
      );
    const response = new CompanyAdvance();
    if (getEnterprise && getEnterprise.code === '0000') {
      response.ssid = getEnterprise.enterprise_setting.ssid;
      response.serviceIntroduction =
        getEnterprise.enterprise_setting.service_introduction;
      response.serviceIntroductionEn =
        getEnterprise.enterprise_setting.service_introduction_en;
      response.accessTime = getEnterprise.enterprise_setting.access_time;
      response.dailyAccess = getEnterprise.enterprise_setting.daily_access;
      response.accessLimit = getEnterprise.enterprise_setting.access_limit;
      response.idleTimeout = getEnterprise.enterprise_setting.idle_timeout;
      response.terms = getEnterprise.enterprise_setting.terms;
      response.termsEn = getEnterprise.enterprise_setting.terms_en;
      response.privacyTerms = getEnterprise.enterprise_setting.privacy_terms;
      response.privacyTermsEn =
        getEnterprise.enterprise_setting.privacy_terms_en;
      response.downloadSpeed = getEnterprise.enterprise_setting.download_speed;
      response.uploadSpeed = getEnterprise.enterprise_setting.upload_speed;
      response.passShowTime = getEnterprise.enterprise_setting.pass_show_time;
    }
    const detailCompanyAdvance = new DetailCompanyAdvance();
    detailCompanyAdvance.node = response;
    return detailCompanyAdvance;
  }

  async addCompany(
    divisionId: string,
    name: string,
    logo: string,
    line: string,
    url: string,
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
  ): Promise<string> {
    const createCompanyId = await this.chtwifiplusClientService.createAreaOwner(
      name,
      logo,
      line,
      url,
    );
    let errmessage = '';
    if (createCompanyId && createCompanyId.message) {
      errmessage = `with error = ${createCompanyId.message}`;
    }
    if (
      createCompanyId &&
      createCompanyId.area_owner &&
      createCompanyId.area_owner.id &&
      createCompanyId.code === '0000'
    ) {
      const setEnterprise =
        await this.chtwifiplusClientService.setEnterpriseSetting(
          createCompanyId.area_owner.id,
          ssid,
          serviceIntroduction,
          serviceIntroductionEn,
          accessTime,
          dailyAccess,
          accessLimit,
          idleTimeout,
          terms,
          termsEn,
          privacyTerms,
          privacyTermsEn,
          downloadSpeed,
          uploadSpeed,
          passShowTime,
        );
      if (setEnterprise && setEnterprise.message) {
        errmessage = `with error = ${setEnterprise.message}`;
      }
      if (setEnterprise && setEnterprise.code === '0000') {
        //Set EnterpriseSetting success
        const groupupdate: GroupModel =
          await this.wifihotspotRepository.updategroup(
            divisionId,
            createCompanyId.area_owner,
          );
        if (
          groupupdate &&
          createCompanyId.area_owner.id &&
          groupupdate.companyId === createCompanyId.area_owner.id.toString()
        ) {
          //update companyId into groups collection success
          //return groupupdate.toApolloGroup();
          return createCompanyId.area_owner.id.toString();
        } else {
          //update companyId into groups collection fail
          const deleteAreaOwner =
            await this.chtwifiplusClientService.deleteAreaOwner(
              createCompanyId.area_owner.id,
            );
          if (deleteAreaOwner.code !== '0000') {
            this.logger.log(
              `(City OS) Update groups companyId - ${createCompanyId.area_owner.id} Fail and (Wifi Plus) deleteAreaOwner Fail.`,
            );
          } else {
            this.logger.log(
              `(City OS) Update groups companyId - ${createCompanyId.area_owner.id} Fail.`,
            );
          }
          throw new ApolloError(
            `AddCompany- ${name} Fail, CityOS update groups Fail`,
            '400',
          );
        }
      } else {
        //Set EnterpriseSetting fail
        const deleteAreaOwner =
          await this.chtwifiplusClientService.deleteAreaOwner(
            createCompanyId.area_owner.id,
          );
        if (deleteAreaOwner.code !== '0000') {
          //deleteAreaOwner fail
          this.logger.log(
            `(Wifi Plus) SetEnterpriseSetting AreaOwner-${createCompanyId.area_owner.id} Fail ${errmessage}and (Wifi Plus) deleteAreaOwner-${createCompanyId.area_owner.id} Fail`,
          );
        } else {
          this.logger.log(
            `(Wifi Plus) SetEnterpriseSetting AreaOwner-${createCompanyId.area_owner.id} Fail ${errmessage}`,
          );
        }
        throw new ApolloError(
          `AddCompany- ${name} Fail, Wifi plus Set enterprise setting Fail ${errmessage}`,
          '400',
        );
      }
    } else {
      throw new ApolloError(
        `AddCompany- ${name} Fail, Wifi plus Create area owner Fail ${errmessage}`,
        '400',
      );
    }
  }

  async deleteCompany(divisionId: string): Promise<string[]> {
    const groups: GroupModel = await this.wifihotspotRepository.getdivision(
      divisionId,
    );
    const deletable: string[] = [];
    if (groups && groups.companyId) {
      const getAreaOwner = await this.chtwifiplusClientService.getAreaOwner(
        parseInt(groups.companyId),
      );
      let errmessage = '';
      if (getAreaOwner && getAreaOwner.message) {
        errmessage = `with error = ${getAreaOwner.message}`;
      }
      if (getAreaOwner && getAreaOwner.code === '0000') {
        const deleteAreaOwner =
          await this.chtwifiplusClientService.deleteAreaOwner(
            parseInt(groups.companyId),
          );
        if (deleteAreaOwner && deleteAreaOwner.message) {
          errmessage = `with error = ${deleteAreaOwner.message}`;
        }
        if (deleteAreaOwner.code !== '0000') {
          throw new ApolloError(
            `DeleteCompany Fail, Delete AreaOwner -${getAreaOwner.area_owner.id}in WIFI PLUS Fail ${errmessage}.`,
            '400',
          );
        } else {
          const groupupdate: GroupModel =
            await this.wifihotspotRepository.deletegroup(divisionId);

          if (!groupupdate.companyId) {
            // return groupupdate.toApolloGroup();
            deletable.push(groupupdate.id.toString());
            return deletable;
          } else {
            throw new ApolloError(
              `DeleteCompany Fail, Delete groups companyId - ${groups.companyId} in City OS Fail.`,
              '400',
            );
          }
        }
      } else {
        if (
          getAreaOwner &&
          getAreaOwner.status &&
          getAreaOwner.status.indexOf('OBJECT_NOT_FOUND') !== -1
        ) {
          const groupupdate: GroupModel =
            await this.wifihotspotRepository.deletegroup(divisionId);
          if (!groupupdate.companyId) {
            // return groupupdate.toApolloGroup();
            deletable.push(groupupdate.id.toString());
            return deletable;
          } else {
            throw new ApolloError(
              `DeleteCompany Fail, Delete groups companyId - ${groups.companyId} in City OS Fail.`,
              '400',
            );
          }
        } else {
          throw new ApolloError(
            `DeleteCompany Fail,getAreaOwner - ${groups.companyId} in Wifi Plus Fail ${errmessage}.`,
            '400',
          );
        }
      }
    } else {
      throw new ApolloError(`Cannot find divisionId-${divisionId}`, '400');
    }
  }

  async editCompany(
    divisionId: string,
    name: string,
    logo: string,
    line: string,
    url: string,
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
  ): Promise<string> {
    const groups: GroupModel = await this.wifihotspotRepository.getdivision(
      divisionId,
    );
    if (groups && groups.companyId) {
      const updateCompany = await this.chtwifiplusClientService.updateAreaOwner(
        groups.companyId,
        name,
        logo,
        line,
        url,
      );
      let errmessage = '';
      if (updateCompany && updateCompany.message) {
        errmessage = `with error = ${updateCompany.message}`;
      }
      if (
        updateCompany &&
        updateCompany.area_owner &&
        updateCompany.area_owner.id &&
        updateCompany.code === '0000'
      ) {
        const groupupdate: GroupModel =
          await this.wifihotspotRepository.updategroupforupdate(
            divisionId,
            updateCompany.area_owner,
          );
        if (
          groupupdate &&
          groupupdate.companyId === updateCompany.area_owner.id.toString() &&
          groupupdate.name === updateCompany.area_owner.name &&
          groupupdate.logo === updateCompany.area_owner.logo &&
          groupupdate.line === updateCompany.area_owner.line &&
          groupupdate.url === updateCompany.area_owner.url
        ) {
          //update companyId into groups collection success
          //return groupupdate.toApolloGroup();
          const setEnterprise =
            await this.chtwifiplusClientService.setEnterpriseSetting(
              parseInt(groups.companyId),
              ssid,
              serviceIntroduction,
              serviceIntroductionEn,
              accessTime,
              dailyAccess,
              accessLimit,
              idleTimeout,
              terms,
              termsEn,
              privacyTerms,
              privacyTermsEn,
              downloadSpeed,
              uploadSpeed,
              passShowTime,
            );
          if (setEnterprise && setEnterprise.message) {
            errmessage = `with error = ${setEnterprise.message}`;
          }
          if (setEnterprise && setEnterprise.code === '0000') {
            return groupupdate.id;
          } else {
            //update companyId into groups collection fail
            throw new ApolloError(
              `EditCompany Fail,setEnterpriseSetting companyId - ${groups.companyId} in Wifi Plus Fail ${errmessage}.`,
              '400',
            );
          }
        } else {
          //update companyId into groups collection fail
          const rollbackAreaOwner =
            await this.chtwifiplusClientService.updateAreaOwner(
              groups.companyId,
              groups.name,
              groups.logo,
              groups.line,
              groups.url,
            );
          if (rollbackAreaOwner && rollbackAreaOwner.message) {
            errmessage = `with error = ${rollbackAreaOwner.message}`;
          }
          if (
            rollbackAreaOwner &&
            rollbackAreaOwner.area_owner &&
            rollbackAreaOwner.area_owner.id &&
            rollbackAreaOwner.code === '0000'
          ) {
            //rollback area_owner success
            throw new ApolloError(
              `EditCompany Fail,Update groups companyId - ${groups.companyId} in City OS Fail.`,
              '400',
            );
          } else {
            throw new ApolloError(
              `EditCompany Fail,Update groups companyId - ${groups.companyId} in City OS Fail and Rollback Area_owner in Wifi Plus Fail ${errmessage}.`,
              '400',
            );
          }
        }
      } else {
        throw new ApolloError(
          `EditCompany Fail,update area_ownerId - ${groups.companyId} in Wifi Plus Fail ${errmessage}.`,
          '400',
        );
      }
    } else {
      throw new ApolloError(`Cannot find divisionId-${divisionId}`, '400');
    }
  }
}
