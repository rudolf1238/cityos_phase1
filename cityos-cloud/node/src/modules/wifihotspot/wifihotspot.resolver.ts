import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WifihotspotService } from './wifihotspot.service';
import { GroupService } from '../group/group.service';
import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { PermissionGuard } from '../permission/permission.guard';
import { CheckPermissions } from '../permission/permission.handler';
import { AppAbility } from '../permission/ability.factory';
import {
  Action,
  DetailCompanyAdvance,
  ResponseWIFI,
  Subject,
  WifiFilter,
} from 'src/graphql.schema';
import { CurrentUser } from '../auth/auth.decorator';
import { User } from 'src/models/user';
import { ForbiddenError } from 'apollo-server-express';
//import GraphQLUpload from 'graphql-upload/package.json';
//import { FileUpload } from 'graphql-upload';

//import { UPLOAD_DIRECTORY_URL } from '../image-mgmt/image-mgmt.controller';
//import { GraphQLUpload, FileUpload } from 'graphql-upload';

@Resolver()
export class WifihotspotResolver {
  constructor(
    private readonly wifihotspotService: WifihotspotService,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
  ) {}

  @UseGuards(PermissionGuard)
  @CheckPermissions((ability: AppAbility) =>
    ability.can(Action.VIEW, Subject.WIFI),
  )
  @Query()
  async searchCompanys(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('email') email: string,
    @Args('currentPage') currentPage: number,
    @Args('pageCount') pageCount: number,
    @Args('filter') filter?: WifiFilter,
  ): Promise<ResponseWIFI> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    return this.wifihotspotService.getDivisionwithUser(
      groupId,
      email,
      currentPage,
      pageCount,
      filter,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermissions((ability: AppAbility) =>
    ability.can(Action.VIEW, Subject.WIFI),
  )
  @Query()
  async searchCompanyAdvance(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('companyId') companyId: string,
  ): Promise<DetailCompanyAdvance> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    return this.wifihotspotService.searchCompanyAdvance(companyId);
  }

  @UseGuards(PermissionGuard)
  @CheckPermissions((ability: AppAbility) =>
    ability.can(Action.ADD, Subject.WIFI),
  )
  @Mutation()
  async addCompany(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('divisionId') divisionId: string,
    @Args('name') name: string,
    @Args('logo') logo: string,
    @Args('line') line: string,
    @Args('url') url: string,
    @Args('ssid') ssid: string,
    @Args('serviceIntroduction') serviceIntroduction: string,
    @Args('serviceIntroductionEn') serviceIntroductionEn: string,
    @Args('accessTime') accessTime: number,
    @Args('dailyAccess') dailyAccess: number,
    @Args('accessLimit') accessLimit: number,
    @Args('idleTimeout') idleTimeout: number,
    @Args('terms') terms: string,
    @Args('termsEn') termsEn: string,
    @Args('privacyTerms') privacyTerms: string,
    @Args('privacyTermsEn') privacyTermsEn: string,
    @Args('downloadSpeed') downloadSpeed: number,
    @Args('uploadSpeed') uploadSpeed: number,
    @Args('passShowTime') passShowTime: number,
  ): Promise<string> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    return this.wifihotspotService.addCompany(
      divisionId,
      name,
      logo,
      line,
      url,
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
  }

  @UseGuards(PermissionGuard)
  @CheckPermissions((ability: AppAbility) =>
    ability.can(Action.REMOVE, Subject.WIFI),
  )
  @Mutation()
  async deleteCompany(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('divisionId') divisionId: string,
  ): Promise<string[]> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    return this.wifihotspotService.deleteCompany(divisionId);
  }

  @UseGuards(PermissionGuard)
  @CheckPermissions((ability: AppAbility) =>
    ability.can(Action.MODIFY, Subject.WIFI),
  )
  @Mutation()
  async editCompany(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('divisionId') divisionId: string,
    @Args('name') name: string,
    @Args('logo') logo: string,
    //@Args('logo', { type: () => GraphQLUpload }) file: FileUpload,
    @Args('line') line: string,
    @Args('url') url: string,
    @Args('ssid') ssid: string,
    @Args('serviceIntroduction') serviceIntroduction: string,
    @Args('serviceIntroductionEn') serviceIntroductionEn: string,
    @Args('accessTime') accessTime: number,
    @Args('dailyAccess') dailyAccess: number,
    @Args('accessLimit') accessLimit: number,
    @Args('idleTimeout') idleTimeout: number,
    @Args('terms') terms: string,
    @Args('termsEn') termsEn: string,
    @Args('privacyTerms') privacyTerms: string,
    @Args('privacyTermsEn') privacyTermsEn: string,
    @Args('downloadSpeed') downloadSpeed: number,
    @Args('uploadSpeed') uploadSpeed: number,
    @Args('passShowTime') passShowTime: number,
  ): Promise<string> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    return this.wifihotspotService.editCompany(
      divisionId,
      name,
      logo,
      line,
      url,
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
  }

  // @UseGuards(PermissionGuard)
  // @CheckPermissions((ability: AppAbility) =>
  //   ability.can(Action.REMOVE, Subject.WIFI),
  // )
  // @Public()
  // @Mutation()
  // async uploadFile(
  //   // @CurrentUser() user: User,
  //   // @Args('groupId') groupId: string,
  //   @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  // ): Promise<string> {
  //   // if (!(await this.groupService.isGroupUnder(user, groupId))) {
  //   //   throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
  //   // }
  //   return this.wifihotspotService.uploadFile(file);
  //   return '';
  // }
}
