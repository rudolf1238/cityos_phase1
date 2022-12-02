/* eslint-disable @typescript-eslint/no-unused-vars */
import { DeviceService } from '../device/device.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { GroupService } from '../group/group.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { GoogleClientService } from '../google-client/google-client/google-client.service';
import { ESignageCMRepository } from './eSignageCM.repository';
import {
  DivisionOutput,
  EmergencyCallInput,
  Filter,
  GetCity,
  GetContentType,
  GetDivision,
  GetEsignageTemplateType,
  GetLanguage,
  GetTemplate,
  GetTemplateContent,
  GetWeatherStyle,
  IpCam,
  IpCamDetail,
  Media,
  TemplateContent,
  TemplateInput,
  TPContent,
  TPContentDetail,
  UpdateTemplateContentInput,
  UpdateTemplateInput,
  User,
  Weather,
  WeatherDeatail,
  Webpage,
  WebpageDetail,
} from 'src/graphql.schema';
import { EsignageTemplateType } from 'src/models/esignage.template.type';
import { EsignageResolution } from 'src/models/esignage.resolution';
import { ApolloError, ForbiddenError } from 'apollo-server-express';
import { ErrorCode } from 'src/models/error.code';
import { EsignageTemplate } from 'src/models/esignage.template';
import { Types } from 'mongoose';
import { EsignageTemplateContent } from 'src/models/esignage.template.content';
import { EsignageWeather } from 'src/models/esignage.weather';
import { EsignageMediaPool } from 'src/models/esignage.media.pool';
import { Id } from '@elastic/elasticsearch/api/types';
import { EsignageWebpage } from 'src/models/esignage.webpage';
import { EsignageIpcam } from 'src/models/esignage.ipcam';
import { EsignageTemplateLogs } from 'src/models/esignage.template.logs';
import { EsignageTemplateContentLogs } from 'src/models/esignage.template.content.logs';
import { EsignageTemplateContentDetail } from 'src/models/esignage.template.content.detail';
import { EsignageTemplateContentDetailLogs } from 'src/models/esignage.template.content.detail.logs';
import { ObjectId } from 'mongodb';

@Injectable()
export class ESignageCMService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => DeviceService))
    private deviceService: DeviceService,
    @Inject(forwardRef(() => GroupService))
    private groupService: GroupService,
    private configService: ConfigService,
    private googleClientService: GoogleClientService,
    private eSignageCMRepository: ESignageCMRepository,
  ) {}

  /**
   * check  parameter zone
   */
  async checkTemplateQueryInput(
    groupId: string,
    page: number,
  ): Promise<boolean> {
    //檢查資料
    if (groupId == null || groupId.length == 0) {
      return false;
    }
    if (page == 0) {
      return false;
    }
    return true;
  }

  async checkTemplateInput(template: TemplateInput): Promise<boolean> {
    //檢查資料
    if (template === null) {
      return false;
    }
    if (
      template.name === null ||
      template.templateType === null ||
      template.description === null ||
      template.templateContent === null
    ) {
      return false;
    }
    return true;
  }

  async checkUpdateTemplateInput(
    template: UpdateTemplateInput,
  ): Promise<boolean> {
    //檢查資料
    if (template === null) {
      return false;
    }
    if (
      template.name === null ||
      template.templateTypeId === null ||
      template.description === null ||
      template.group === null
    ) {
      return false;
    }
    return true;
  }

  async checkUpdateTemplateContentInput(
    template: UpdateTemplateContentInput,
  ): Promise<boolean> {
    //檢查資料
    if (template === null) {
      return false;
    }
    return true;
  }

  /**
   * Query Zone
   */
  async getDivision(groupId: string, filter: Filter): Promise<GetDivision> {
    const division = await this.eSignageCMRepository.getDivision(groupId);
    const totalCount = division.length;
    const newList = new GetDivision();
    newList.divisionOutput = division;
    newList.totalCount = totalCount;
    return newList;
  }

  async getTemplateType(
    page: number,
    pageSize: number,
    filter: Filter,
  ): Promise<GetEsignageTemplateType> {
    const totalCount = await this.eSignageCMRepository.getTemplateTypeCount();
    if (totalCount == 0) {
      throw new ApolloError(
        `ESignage template is empty`,
        ErrorCode.ESIGNAGNE_TEMPLATE_EMPTY,
      );
    }
    if (pageSize == null || pageSize == 0) {
      pageSize = totalCount;
    }
    const typeList = await this.eSignageCMRepository.getTemplateType(
      page,
      pageSize,
      filter,
    );
    const newList = new GetEsignageTemplateType();
    newList.esignageTemplateTypeOutput = typeList;
    newList.totalCount = totalCount;
    return newList;
  }

  async getWeatherStyle(
    page: number,
    pageSize: number,
  ): Promise<GetWeatherStyle> {
    const totalCount = await this.eSignageCMRepository.getWeatherStyleCount();
    if (totalCount == 0) {
      throw new ApolloError(
        `ESignage template is empty`,
        ErrorCode.ESIGNAGNE_TEMPLATE_EMPTY,
      );
    }
    if (pageSize == null || pageSize == 0) {
      pageSize = totalCount;
    }
    const styleList = await this.eSignageCMRepository.getWeatherStyle(
      page,
      pageSize,
    );
    const weatherStyleList = new GetWeatherStyle();
    weatherStyleList.weatherStyleOutput = styleList;
    weatherStyleList.totalCount = totalCount;
    return weatherStyleList;
  }

  async getLanguage(page: number, pageSize: number): Promise<GetLanguage> {
    const totalCount = await this.eSignageCMRepository.getLanguageCount();
    if (totalCount == 0) {
      throw new ApolloError(
        `ESignage template is empty`,
        ErrorCode.ESIGNAGNE_TEMPLATE_EMPTY,
      );
    }
    if (pageSize == null || pageSize == 0) {
      pageSize = totalCount;
    }
    const styleList = await this.eSignageCMRepository.getLanguageCode(
      page,
      pageSize,
    );
    const languageCodeList = new GetLanguage();
    languageCodeList.languageOutput = styleList;
    languageCodeList.totalCount = totalCount;
    return languageCodeList;
  }

  async getCity(page: number, pageSize: number): Promise<GetCity> {
    const totalCount = await this.eSignageCMRepository.getCityCount();
    if (totalCount == 0) {
      throw new ApolloError(
        `ESignage template is empty`,
        ErrorCode.ESIGNAGNE_TEMPLATE_EMPTY,
      );
    }
    if (pageSize == null || pageSize == 0) {
      pageSize = totalCount;
    }
    const styleList = await this.eSignageCMRepository.getCity(page, pageSize);
    const cityList = new GetCity();
    cityList.cityOutput = styleList;
    cityList.totalCount = totalCount;
    return cityList;
  }

  async getContentType(
    page: number,
    pageSize: number,
  ): Promise<GetContentType> {
    const totalCount = await this.eSignageCMRepository.getContentTypeCount();
    if (totalCount == 0) {
      throw new ApolloError(
        `ESignage template is empty`,
        ErrorCode.ESIGNAGNE_TEMPLATE_EMPTY,
      );
    }
    if (pageSize == null || pageSize == 0) {
      pageSize = totalCount;
    }
    const List = await this.eSignageCMRepository.getContentType(page, pageSize);
    const CTList = new GetContentType();
    CTList.contentTypeOutput = List;
    CTList.totalCount = totalCount;
    return CTList;
  }

  async getTemplate(
    groupId: string,
    page: number,
    pageSize: number,
    filter: Filter,
  ): Promise<GetTemplate> {
    const totalCount = await this.eSignageCMRepository.getTemplateCount(
      groupId,
    );
    if (totalCount == 0) {
      throw new ApolloError(
        `ESignage template is empty`,
        ErrorCode.ESIGNAGNE_TEMPLATE_EMPTY,
      );
    }
    if (pageSize == null || pageSize == 0 || pageSize == undefined) {
      pageSize = totalCount;
    }
    const typeList = await this.eSignageCMRepository.getTemplate(
      groupId,
      page,
      pageSize,
      filter,
    );
    const newList = new GetTemplate();
    newList.templateOutput = typeList;
    newList.totalCount = totalCount;
    return newList;
  }

  async getTemplateContent(templateId: string): Promise<GetTemplateContent> {
    const templateInterface = new GetTemplateContent();
    const template: EsignageTemplate =
      await this.eSignageCMRepository.getTemplateContent(templateId);
    templateInterface.id = template._id.toString();
    templateInterface.name = template.name;
    templateInterface.description = template.description;
    templateInterface.group = template.group.toString();
    const tpList = await this.getContentByTemplateId(templateId);
    templateInterface.templateContent = tpList;
    console.log(templateInterface);
    return templateInterface;
  }

  async getContentByTemplateId(templateId: string): Promise<TPContent[]> {
    const tPContentList: TPContent[] = [];
    const templateContent =
      await this.eSignageCMRepository.getContentByTemplateId(templateId);
    for (const t of templateContent) {
      const tpContent = new TPContent();
      tpContent.contentId = t._id.toString();
      tpContent.templateId = t.templateId.toString();
      tpContent.contentTypeId = t.contentTypeId.toString();
      tpContent.contentName = t.contentName;
      tpContent.tag = t.tag ?? 'null';
      tpContent.x = t.x;
      tpContent.y = t.y;
      tpContent.width = t.width;
      tpContent.height = t.height;
      const detail = await this.getContentDetailByContentId(
        tpContent.contentId,
      );
      tpContent.templateContentDetail = detail;
      tPContentList.push(tpContent);
      console.log(tpContent);
    }
    return tPContentList;
  }

  async getContentDetailByContentId(
    contentId: string,
  ): Promise<TPContentDetail> {
    const res = new TPContentDetail();
    const contentDetail =
      await this.eSignageCMRepository.getContentDetailByContentId(contentId);
    console.log(contentDetail);
    if (contentDetail.weatherId) {
      const weatherDetail = await this.getWeatherDetailByWeatherId(
        contentDetail.weatherId.toString(),
      );
      res.weather = weatherDetail;
    }
    if (contentDetail.mediaIds.length > 0) {
      res.media = contentDetail.mediaIds.map((it) => it.toString());
    }
    if (contentDetail.webPageIds.length > 0) {
      const webpageIds = contentDetail.webPageIds.flatMap((it) =>
        it.toString(),
      );
      const webPageList = await this.getWebpageDetailByWebpageId(webpageIds);
      res.webpage = webPageList;
    }
    if (contentDetail.camIds.length > 0) {
      const camIds = contentDetail.camIds.flatMap((it) => it.toString());
      const camList = await this.getCamDetailByCamId(camIds);
      res.cam = camList;
    }
    return res;
  }

  async getWeatherDetailByWeatherId(
    weatherId: string,
  ): Promise<WeatherDeatail> {
    const weather = new WeatherDeatail();
    const weatherDetail =
      await this.eSignageCMRepository.getWeatherDetailByWeatherId(weatherId);
    weather.id = weatherDetail.id;
    weather.weatherStyleId = weatherDetail.weatherStyleId.toString();
    weather.temperatureUnit = weatherDetail.temperatureUnit;
    weather.windSpeedUnit = weatherDetail.windSpeedUnit;
    weather.languageId = weatherDetail.languageId.toString();
    weather.backgroundColor = weatherDetail.backgroundColor;
    weather.durations = weatherDetail.durations;
    weather.citys = weatherDetail.citys;
    return weather;
  }

  async getWebpageDetailByWebpageId(
    webPageIds: string[],
  ): Promise<WebpageDetail[]> {
    const webPageList: WebpageDetail[] = [];
    for (const wId of webPageIds) {
      const webPage = new WebpageDetail();
      const webDetail =
        await this.eSignageCMRepository.getWebpageDetailByWebpageId(wId);
      webPage.id = webDetail.id;
      webPage.webUrl = webDetail.webUrl;
      webPage.playTime = webDetail.playTime;
      webPageList.push(webPage);
    }
    return webPageList;
  }

  async getCamDetailByCamId(camIds: string[]): Promise<IpCamDetail[]> {
    const camList: IpCamDetail[] = [];
    for (const cId of camIds) {
      const ipCam = new IpCamDetail();
      const cam = await this.eSignageCMRepository.getCamDetailByCamId(cId);
      ipCam.id = cam.id;
      ipCam.camName = cam.camName;
      ipCam.rtspUrl = cam.rtspUrl;
      ipCam.durations = cam.durations;
      camList.push(ipCam);
    }
    return camList;
  }

  /**
   * mutation zone
   */
  async addTemplate(
    groupId: string,
    userId: Id,
    templateInput: TemplateInput,
  ): Promise<string> {
    const templateId = await this.createTemplate(groupId, templateInput);
    const templateLogsId = await this.createTemplateLogs(
      userId,
      groupId,
      templateId,
      templateInput,
      'ADD',
    );
    //for each content and create template_content
    for (const content of templateInput.templateContent) {
      const templateContentId = await this.createTemplateContent(
        content,
        templateId,
      );
      const contentLogId = await this.createTemplateContentLogs(
        templateId,
        content,
        templateLogsId,
      );
      if (content.contentDeatail.weather) {
        console.log('weather not empty, create weather data.');
        const weatherId = await this.createWeather(content);
        //write Template Content Detail
        const contentDetail = new EsignageTemplateContentDetail();
        contentDetail.contentId = new Types.ObjectId(templateContentId);
        contentDetail.weatherId = new Types.ObjectId(weatherId);
        await this.eSignageCMRepository.addTemplateContentDetail(contentDetail);
        const contentDetailLogs = new EsignageTemplateContentDetailLogs();
        contentDetailLogs.contentId = new Types.ObjectId(templateContentId);
        contentDetailLogs.weatherId = new Types.ObjectId(weatherId);
        contentDetailLogs.logsId = new Types.ObjectId(templateLogsId);
        await this.eSignageCMRepository.addTemplateContentDetailLogs(
          contentDetailLogs,
        );
        //end write Template Content Detail
      }
      if (content.contentDeatail.ipCam) {
        console.log('ipCam not empty, create ipCam data.');
        const ipCamIdList: string[] = [];
        for (const m of content.contentDeatail.ipCam) {
          const ipCamId = await this.createIpCam(m);
          ipCamIdList.push(ipCamId);
        }
        console.log('--ipCamIdList:', ipCamIdList);
        //write Template Content Detail
        const contentDetail = new EsignageTemplateContentDetail();
        contentDetail.weatherId = null;
        contentDetail.contentId = new Types.ObjectId(templateContentId);
        contentDetail.camIds = ipCamIdList.flatMap(
          (it) => new Types.ObjectId(it),
        );
        await this.eSignageCMRepository.addTemplateContentDetail(contentDetail);
        const contentDetailLogs = new EsignageTemplateContentDetailLogs();
        contentDetailLogs.contentId = new Types.ObjectId(templateContentId);
        contentDetailLogs.camIds = ipCamIdList.flatMap(
          (it) => new Types.ObjectId(it),
        );
        contentDetailLogs.logsId = new Types.ObjectId(templateLogsId);
        await this.eSignageCMRepository.addTemplateContentDetailLogs(
          contentDetailLogs,
        );
        //end write Template Content Detail
      }
      if (content.contentDeatail.webpage) {
        console.log('webpage not empty, create webpage data.');
        const webPageIdList: string[] = [];
        for (const m of content.contentDeatail.webpage) {
          const webPageId = await this.createWebPage(m);
          webPageIdList.push(webPageId);
        }
        console.log(webPageIdList);
        //write Template Content Detail
        const contentDetail = new EsignageTemplateContentDetail();
        contentDetail.weatherId = null;
        contentDetail.contentId = new Types.ObjectId(templateContentId);
        contentDetail.webPageIds = webPageIdList.flatMap(
          (it) => new Types.ObjectId(it),
        );
        await this.eSignageCMRepository.addTemplateContentDetail(contentDetail);
        const contentDetailLogs = new EsignageTemplateContentDetailLogs();
        contentDetailLogs.contentId = new Types.ObjectId(templateContentId);
        contentDetailLogs.webPageIds = webPageIdList.flatMap(
          (it) => new Types.ObjectId(it),
        );
        contentDetailLogs.logsId = new Types.ObjectId(templateLogsId);
        await this.eSignageCMRepository.addTemplateContentDetailLogs(
          contentDetailLogs,
        );
        //end write Template Content Detail
      }
      if (content.contentDeatail.media) {
        console.log('media not empty, create media data.');
        const mediaIdList: string[] = [];
        for (const m of content.contentDeatail.media) {
          const mediaId = await this.createMedia(m, userId, templateId);
          mediaIdList.push(mediaId);
        }
        console.log(mediaIdList);
        //write Template Content Detail
        const contentDetail = new EsignageTemplateContentDetail();
        contentDetail.weatherId = null;
        contentDetail.contentId = new Types.ObjectId(templateContentId);
        contentDetail.mediaIds = mediaIdList.flatMap(
          (it) => new Types.ObjectId(it),
        );
        await this.eSignageCMRepository.addTemplateContentDetail(contentDetail);
        const contentDetailLogs = new EsignageTemplateContentDetailLogs();
        contentDetailLogs.contentId = new Types.ObjectId(templateContentId);
        contentDetailLogs.mediaIds = mediaIdList.flatMap(
          (it) => new Types.ObjectId(it),
        );
        contentDetailLogs.logsId = new Types.ObjectId(templateLogsId);
        await this.eSignageCMRepository.addTemplateContentDetailLogs(
          contentDetailLogs,
        );
        //end write Template Content Detail
      }
    }
    // await this.eSignageCMRepository.deleteTemplate(templateId);
    return templateLogsId;
  }

  async updateTemplate(
    groupId: string,
    userId: Id,
    templateId: string,
    templateInput: UpdateTemplateInput,
  ): Promise<boolean> {
    await this.eSignageCMRepository.updateTemplate(templateId, templateInput);
    return true;
  }

  async updateTemplateContent(
    groupId: string,
    templateId: string,
    userId: string,
    templateContent: UpdateTemplateContentInput,
  ): Promise<boolean> {
    for (const content of templateContent.updateTemplateContent) {
      await this.eSignageCMRepository.updateTemplateContent(
        content.contentId,
        content,
      );
      if (content.contentDeatail.weather) {
        console.log('weather not empty, create weather data.');
        const weatherId = await this.createWeather(content);
        await this.eSignageCMRepository.updateTemplateContentDetailByWeather(
          content.contentId,
          weatherId,
        );
      }
      if (content.contentDeatail.ipCam) {
        console.log('ipCam not empty, create ipCam data.');
        const ipCamIdList: string[] = [];
        for (const m of content.contentDeatail.ipCam) {
          const ipCamId = await this.createIpCam(m);
          ipCamIdList.push(ipCamId);
        }
        await this.eSignageCMRepository.updateTemplateContentDetailByIpcam(
          content.contentId,
          ipCamIdList,
        );
      }
      if (content.contentDeatail.webpage) {
        console.log('webpage not empty, create webpage data.');
        const webPageIdList: string[] = [];
        for (const m of content.contentDeatail.webpage) {
          const webPageId = await this.createWebPage(m);
          webPageIdList.push(webPageId);
        }
        await this.eSignageCMRepository.updateTemplateContentDetailByWebpage(
          content.contentId,
          webPageIdList,
        );
      }
      if (content.contentDeatail.media) {
        console.log('media not empty, create media data.');
        const mediaIdList: string[] = [];
        for (const m of content.contentDeatail.media) {
          const mediaId = await this.createMedia(m, userId, templateId);
          mediaIdList.push(mediaId);
        }
        await this.eSignageCMRepository.updateTemplateContentDetailByMedia(
          content.contentId,
          mediaIdList,
        );
      }
    }
    return true;
  }

  async deleteTemplate(
    groupId: string,
    userId: Id,
    templateId: string,
  ): Promise<boolean> {
    const template = new TemplateInput();
    const templateText =
      await this.eSignageCMRepository.getTemplateByTemplateId(
        new Types.ObjectId(templateId),
      );
    if (!templateText) {
      throw new ApolloError(
        `TemplateId is not exist.`,
        ErrorCode.ESIGNAGNE_TEMPLATE_IS_NOT_EXIST,
      );
    }
    template.name = templateText.name;
    template.templateType = templateText.templateTypeId.toString();
    template.backgroundColor = templateText.backgroundColor;
    template.description = templateText.description;

    await this.createTemplateLogs(
      userId,
      groupId,
      templateId,
      template,
      'DELETE',
    );

    const tcList = await this.eSignageCMRepository.getContentByTemplateId(
      templateId,
    );
    for (const tc of tcList) {
      const cid = tc._id.toString();
      const detail =
        await this.eSignageCMRepository.getContentDetailByContentId(cid);
      const detailId = detail._id;
      if (detail.weatherId) {
        //刪除weather
        console.log(detail.weatherId.toString());
        await this.eSignageCMRepository.deleteWeather(detail.weatherId);
      }
      if (detail.mediaIds.length > 0) {
        for (const mId of detail.mediaIds) {
          await this.eSignageCMRepository.deleteMedia(mId);
        }
      }
      if (detail.webPageIds.length > 0) {
        for (const wId of detail.webPageIds) {
          await this.eSignageCMRepository.deleteMedia(wId);
        }
      }
      if (detail.camIds.length > 0) {
        for (const cId of detail.camIds) {
          await this.eSignageCMRepository.deleteMedia(cId);
        }
      }
      await this.eSignageCMRepository.deleteContentDetail(detailId);
      await this.eSignageCMRepository.deleteContent(tc._id);
    }
    await this.eSignageCMRepository.deleteTemplate(
      new Types.ObjectId(templateId),
    );

    return true;
  }

  async createTemplate(
    groupId: string,
    templateInput: TemplateInput,
  ): Promise<string> {
    const eSignageTemplateData = new EsignageTemplate();
    eSignageTemplateData.name = templateInput.name;
    eSignageTemplateData.description = templateInput.description;
    eSignageTemplateData.templateTypeId = new Types.ObjectId(
      templateInput.templateType,
    );
    eSignageTemplateData.backgroundColor = templateInput.backgroundColor;
    eSignageTemplateData.group = new Types.ObjectId(groupId);
    //回傳template.id
    const templateId = await this.eSignageCMRepository.addTemplate(
      eSignageTemplateData,
    );
    if (templateId === null || templateId == undefined) {
      throw new ApolloError(
        `ADD ESignage template faile`,
        ErrorCode.ESIGNAGNE_ADD_TEMPLATE_FAILE,
      );
    }
    console.log('Template ID:', templateId);
    return templateId;
  }

  async createTemplateLogs(
    userId: Id,
    groupId: string,
    templateId: string,
    templateInput: TemplateInput,
    memo: string,
  ): Promise<string> {
    const templateLogs = new EsignageTemplateLogs();
    templateLogs.templateId = new Types.ObjectId(templateId);
    templateLogs.name = templateInput.name;
    templateLogs.templateTypeId = new Types.ObjectId(
      templateInput.templateType,
    );
    templateLogs.description = templateInput.description;
    templateLogs.backgroundColor = templateInput.backgroundColor;
    templateLogs.group = new Types.ObjectId(groupId);
    templateLogs.userId = new Types.ObjectId(userId);
    templateLogs.memo = memo;
    templateLogs.status = 1;
    const logsId = await this.eSignageCMRepository.addTemplateLogs(
      templateLogs,
    );
    return logsId;
  }

  async createTemplateContent(
    content: TemplateContent,
    templateId: string,
  ): Promise<string> {
    const templateContent = new EsignageTemplateContent();
    templateContent.templateId = new Types.ObjectId(templateId);
    templateContent.contentTypeId = new Types.ObjectId(content.contentTypeId);
    templateContent.contentName = content.contentName;
    templateContent.tag = content.tag ?? null;
    templateContent.x = content.x ?? null;
    templateContent.y = content.y ?? null;
    templateContent.width = content.width ?? null;
    templateContent.height = content.height ?? null;
    const templateContentId =
      await this.eSignageCMRepository.addTemplateContent(templateContent);
    if (templateContentId === null || templateContentId == undefined) {
      throw new ApolloError(
        `ADD ESignage template content faile`,
        ErrorCode.ESIGNAGNE_ADD_TEMPLATE_CONTENT_FAILE,
      );
    }
    console.log('templateContentId', templateContentId);
    return templateContentId;
  }

  async createTemplateContentLogs(
    templateId: string,
    content: TemplateContent,
    templateLogId: string,
  ): Promise<string> {
    const templateContentLogs = new EsignageTemplateContentLogs();
    templateContentLogs.logId = new Types.ObjectId(templateLogId);
    templateContentLogs.templateId = new Types.ObjectId(templateId);
    templateContentLogs.contentTypeId = new Types.ObjectId(
      content.contentTypeId,
    );
    templateContentLogs.contentName = content.contentName;
    templateContentLogs.tag = content.tag ?? null;
    templateContentLogs.x = content.x ?? null;
    templateContentLogs.y = content.y ?? null;
    templateContentLogs.width = content.width ?? null;
    templateContentLogs.height = content.height ?? null;
    const contentLogId = await this.eSignageCMRepository.addTemplateContentLogs(
      templateContentLogs,
    );
    return contentLogId;
  }

  async createWeather(content: TemplateContent): Promise<string> {
    const weather = new EsignageWeather();
    weather.weatherStyleId = new Types.ObjectId(
      content.contentDeatail.weather.weatherStyleId,
    );
    weather.temperatureUnit =
      content.contentDeatail.weather.temperatureUnit ?? 'C';
    weather.windSpeedUnit = content.contentDeatail.weather.windSpeedUnit ?? 'K';
    weather.languageId =
      new Types.ObjectId(content.contentDeatail.weather.languageId) ??
      new Types.ObjectId('628c7b973722a78e25c70f38');
    weather.backgroundColor =
      content.contentDeatail.weather.backgroundColor ?? null;
    weather.durations = content.contentDeatail.weather.durations ?? null;
    weather.citys = content.contentDeatail.weather.citys;
    const weatherId = await this.eSignageCMRepository.addWeather(weather);
    console.log('--Weather Id:', weatherId);
    if (weatherId === null || weatherId == undefined) {
      throw new ApolloError(
        `ADD ESignage weather faile`,
        ErrorCode.ESIGNAGNE_ADD_WEATHER_FAILE,
      );
    }
    return weatherId;
  }

  async createIpCam(cam: IpCam): Promise<string> {
    const ipCam = new EsignageIpcam();
    ipCam.camName = cam.camName;
    ipCam.rtspUrl = cam.rtspUrl;
    ipCam.durations = cam.durations ?? null;
    const ipCamId = await this.eSignageCMRepository.addIpCam(ipCam);
    if (ipCamId === null || ipCamId == undefined) {
      throw new ApolloError(
        `ADD ESignage ipCam faile`,
        ErrorCode.ESIGNAGNE_ADD_IPCAM_FAILE,
      );
    }
    return ipCamId;
  }

  async createWebPage(web: Webpage): Promise<string> {
    const webpage = new EsignageWebpage();
    webpage.webUrl = web.webUrl;
    webpage.playTime = web.playTime ?? null;
    const webPageId = await this.eSignageCMRepository.addWebPage(webpage);
    if (webPageId === null || webPageId == undefined) {
      throw new ApolloError(
        `ADD ESignage webPage faile`,
        ErrorCode.ESIGNAGNE_ADD_WEBPAGE_FAILE,
      );
    }
    return webPageId;
  }

  async createMedia(m: Media, userId: Id, templateId: string): Promise<string> {
    const media = new EsignageMediaPool();
    media.mediaId = new Types.ObjectId(m.mediaId);
    media.userId = new Types.ObjectId(userId);
    media.templateId = new Types.ObjectId(templateId);
    media.imagePlayDurations = m.imagePlayDurations ?? null;
    const mediaId = await this.eSignageCMRepository.addMediaPool(media);
    if (mediaId === null || mediaId == undefined) {
      throw new ApolloError(
        `ADD ESignage media faile`,
        ErrorCode.ESIGNAGNE_ADD_MEDIA_FAILE,
      );
    }
    return mediaId;
  }
}
