import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ESignageCMService } from './eSignageCM.service';

import { forwardRef, Inject } from '@nestjs/common';
import { GroupService } from '../group/group.service';
import { CurrentUser } from '../auth/auth.decorator';
import { User } from 'src/models/user';
import { ESignageCMRepository } from './eSignageCM.repository';
import {
  DeviceConnection,
  DeviceFilter,
  DeviceType,
  Filter,
  GetCity,
  GetContentType,
  GetDivision,
  GetEsignageTemplateType,
  GetLanguage,
  GetTemplate,
  GetTemplateContent,
  GetWeatherStyle,
  TemplateInput,
  UpdateTemplateContentInput,
  UpdateTemplateInput,
} from 'src/graphql.schema';
import { ApolloError, ForbiddenError } from 'apollo-server-express';
import { ErrorCode } from 'src/models/error.code';
import { DeviceService } from '../device/device.service';

@Resolver('ESignageCM')
export class ESignageCMResolver {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly esignageCMRService: ESignageCMService,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    private eSignageCMRepository: ESignageCMRepository,
  ) {}

  // @UseGuards(PermissionGuard)
  // @CheckPermissions(
  //   (ability: AppAbility) =>
  //     ability.can(Action.VIEW, Subject.DEVICE) ||
  //     ability.can(Action.VIEW, Subject.LIGHTMAP),
  // )
  /**
   * @description Query Zone
   */
  @Query()
  async getDivision(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('filter') filter: Filter,
  ): Promise<GetDivision> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    const newList: GetDivision = await this.esignageCMRService.getDivision(
      groupId,
      filter,
    );
    console.log(newList);
    return newList;
  }

  @Query()
  async getTemplateType(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
    @Args('filter') filter: Filter,
  ): Promise<GetEsignageTemplateType> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    if (
      !(await this.esignageCMRService.checkTemplateQueryInput(groupId, page))
    ) {
      throw new ApolloError(
        `ESignage input value error.`,
        ErrorCode.ESIGNAGNE_VALUE_ERROR,
      );
    }
    const newList: GetEsignageTemplateType =
      await this.esignageCMRService.getTemplateType(page, pageSize, filter);
    console.log(newList);
    return newList;
  }

  @Query()
  async getWeatherStyle(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
    @Args('filter') _filter: Filter,
  ): Promise<GetWeatherStyle> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    if (
      !(await this.esignageCMRService.checkTemplateQueryInput(groupId, page))
    ) {
      throw new ApolloError(
        `ESignage input value error.`,
        ErrorCode.ESIGNAGNE_VALUE_ERROR,
      );
    }
    const newList: GetWeatherStyle =
      await this.esignageCMRService.getWeatherStyle(page, pageSize);
    console.log(newList);
    return newList;
  }

  @Query()
  async getLanguage(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
    @Args('filter') _filter: Filter,
  ): Promise<GetLanguage> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    if (
      !(await this.esignageCMRService.checkTemplateQueryInput(groupId, page))
    ) {
      throw new ApolloError(
        `ESignage input value error.`,
        ErrorCode.ESIGNAGNE_VALUE_ERROR,
      );
    }
    const newList: GetLanguage = await this.esignageCMRService.getLanguage(
      page,
      pageSize,
    );
    console.log(newList);
    return newList;
  }

  @Query()
  async getCity(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
    @Args('filter') _filter: Filter,
  ): Promise<GetCity> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    if (
      !(await this.esignageCMRService.checkTemplateQueryInput(groupId, page))
    ) {
      throw new ApolloError(
        `ESignage input value error.`,
        ErrorCode.ESIGNAGNE_VALUE_ERROR,
      );
    }
    const newList: GetCity = await this.esignageCMRService.getCity(
      page,
      pageSize,
    );
    console.log(newList);
    return newList;
  }

  @Query()
  async getContentType(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
    @Args('filter') _filter: Filter,
  ): Promise<GetContentType> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    if (
      !(await this.esignageCMRService.checkTemplateQueryInput(groupId, page))
    ) {
      throw new ApolloError(
        `ESignage input value error.`,
        ErrorCode.ESIGNAGNE_VALUE_ERROR,
      );
    }
    const newList: GetContentType =
      await this.esignageCMRService.getContentType(page, pageSize);
    console.log(newList);
    return newList;
  }

  @Query()
  async getTemplate(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
    @Args('filter') filter: Filter,
  ): Promise<GetTemplate> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    if (
      !(await this.esignageCMRService.checkTemplateQueryInput(groupId, page))
    ) {
      throw new ApolloError(
        `ESignage input value error.`,
        ErrorCode.ESIGNAGNE_VALUE_ERROR,
      );
    }
    const newList: GetTemplate = await this.esignageCMRService.getTemplate(
      groupId,
      page,
      pageSize,
      filter,
    );
    console.log(newList);
    return newList;
  }

  @Query()
  async getTemplateContent(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('templateId') templateId: string,
  ): Promise<GetTemplateContent> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    const newList = await this.esignageCMRService.getTemplateContent(
      templateId,
    );
    console.log(newList);
    return newList;
  }

  @Query()
  async getPlayerData(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('size') size?: number,
    @Args('after') after?: string,
    @Args('before') before?: string,
  ): Promise<DeviceConnection> {
    // permission check: 'groupId' must under user's current division
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }

    if (after && before) {
      throw new ApolloError(
        'You can not provide the after and before at the same time.',
        ErrorCode.INPUT_PARAMETERS_INVALID,
      );
    }

    const filter = new DeviceFilter();
    filter.type = DeviceType.DISPLAY;

    return this.deviceService.searchDevices(
      groupId,
      filter,
      size,
      after,
      before,
    );
  }

  /**
   *@description Mutution Zone
   */
  @Mutation('addTemplate')
  async addTemplate(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('templateInput') templateInput: TemplateInput,
  ): Promise<string> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    //check input value
    if (!(await this.esignageCMRService.checkTemplateInput(templateInput))) {
      throw new ApolloError(
        `ESignage Template input value error.`,
        ErrorCode.ESIGNAGNE_ADDTEMPLATE_INPUT_INVALUE,
      );
    }
    const res = await this.esignageCMRService.addTemplate(
      groupId,
      user.id,
      templateInput,
    );
    return res;
  }

  @Mutation('updateTemplate')
  async updateTemplate(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('templateId') templateId: string,
    @Args('updateTemplateInput') updateTemplateInput: UpdateTemplateInput,
  ): Promise<boolean> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    //check input value
    if (!templateId) {
      throw new ApolloError(
        `ESignage TemplateId is empty`,
        ErrorCode.ESIGNAGNE_UPDATETEMPLATE_ID_EMPTY,
      );
    }
    if (
      !(await this.esignageCMRService.checkUpdateTemplateInput(
        updateTemplateInput,
      ))
    ) {
      throw new ApolloError(
        `ESignage Template input value error.`,
        ErrorCode.ESIGNAGNE_UPDATETEMPLATE_INPUT_INVALUE,
      );
    }
    const res = await this.esignageCMRService.updateTemplate(
      groupId,
      user.id,
      templateId,
      updateTemplateInput,
    );
    return res;
  }

  @Mutation('updateTemplateContent')
  async updateTemplateContent(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('templateId') templateId: string,
    @Args('updateTemplateContentInput')
    updateTemplateContentInput: UpdateTemplateContentInput,
  ): Promise<boolean> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    if (
      !(await this.esignageCMRService.checkUpdateTemplateContentInput(
        updateTemplateContentInput,
      ))
    ) {
      throw new ApolloError(
        `ESignage Template Content input value error.`,
        ErrorCode.ESIGNAGNE_UPDATETEMPLATECONTENT_INPUT_INVALUE,
      );
    }
    const res = await this.esignageCMRService.updateTemplateContent(
      groupId,
      templateId,
      user.id,
      updateTemplateContentInput,
    );
    return res;
  }

  @Mutation('deleteTemplate')
  async deleteTemplate(
    @CurrentUser() user: User,
    @Args('groupId') groupId: string,
    @Args('templateId') templateId: string,
  ): Promise<boolean> {
    if (!(await this.groupService.isGroupUnder(user, groupId))) {
      throw new ForbiddenError(`You have no permission to visit ${groupId}.`);
    }
    //check input value
    if (!templateId) {
      throw new ApolloError(
        `ESignage TemplateId is empty`,
        ErrorCode.ESIGNAGNE_DELETETEMPLATE_ID_EMPTY,
      );
    }
    const res = await this.esignageCMRService.deleteTemplate(
      groupId,
      user.id,
      templateId,
    );
    return res;
  }
}
