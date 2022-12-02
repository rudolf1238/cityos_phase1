import { DeviceService } from '../device/device.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { GroupService } from '../group/group.service';
import { UserService } from '../user/user.service';
import { ChtiotClientService } from '../chtiot-client/chtiot-client.service';
import { ConfigService } from '@nestjs/config';
import { ApolloError } from 'apollo-server-express';
import { GoogleClientService } from '../google-client/google-client/google-client.service';
import {
  EsignageTemplate,
  EsignageTemplateDocument,
} from 'src/models/esignage.template';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  EsignageTemplateContent,
  EsignageTemplateContentDocument,
} from 'src/models/esignage.template.content';
import {
  EsignageTemplateContentDetail,
  EsignageTemplateContentDetailDocument,
} from 'src/models/esignage.template.content.detail';
import {
  EsignageWebpage,
  EsignageWebpageDocument,
} from 'src/models/esignage.webpage';
import {
  EsignageIpcam,
  EsignageIpcamDocument,
} from 'src/models/esignage.ipcam';
import {
  EsignageWeather,
  EsignageWeatherDocument,
} from 'src/models/esignage.weather';
import {
  EsignageMediaPool,
  EsignageMediaPoolDocument,
} from 'src/models/esignage.media.pool';
import {
  EsignageSchedule,
  EsignageScheduleDocument,
} from 'src/models/esignage.schedule';
import {
  EsignageScheduleLogs,
  EsignageScheduleLogsDocument,
} from 'src/models/esignage.schedule.logs';
import {
  EsignageTemplateLogs,
  EsignageTemplateLogsDocument,
} from 'src/models/esignage.template.logs';
import {
  EsignageTemplateContentLogs,
  EsignageTemplateContentLogsDocument,
} from 'src/models/esignage.template.content.logs';
import {
  EsignageTemplateContentDetailLogs,
  EsignageTemplateContentDetailLogsDocument,
} from 'src/models/esignage.template.content.detail.logs';
import {
  CityOutput,
  ContentTypeOutput,
  DivisionOutput,
  EsignageTemplateTypeOutput,
  Filter,
  LanguageOutput,
  TemplateOutput,
  UpdateTemplateContent,
  UpdateTemplateInput,
  WeatherStyleOutput,
} from 'src/graphql.schema';
import {
  EsignageTemplateType,
  EsignageTemplateTypeDocument,
} from 'src/models/esignage.template.type';
import {
  EsignageWeatherStyle,
  EsignageWeatherStyleDocument,
} from 'src/models/esignage.weather.style';
import { LanguageCode, LanguageCodeDocument } from 'src/models/language.code';
import { City, CityDocument } from 'src/models/city';
import { ErrorCode } from 'src/models/error.code';
import {
  EsignageContentType,
  EsignageContentTypeDocument,
} from 'src/models/esignage.content.type';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface TemplateCount {
  templateCount: number;
}

@Injectable()
export class ESignageCMRepository {
  constructor(
    @InjectModel(EsignageTemplate.name)
    private readonly esignageTemplateModel: Model<EsignageTemplateDocument>,
    @InjectModel(EsignageTemplateContent.name)
    private readonly esignageTemplateContentModel: Model<EsignageTemplateContentDocument>,
    @InjectModel(EsignageTemplateContentDetail.name)
    private readonly esignageTemplateContentDetailModel: Model<EsignageTemplateContentDetailDocument>,
    @InjectModel(EsignageWebpage.name)
    private readonly esignageWebpageModel: Model<EsignageWebpageDocument>,
    @InjectModel(EsignageIpcam.name)
    private readonly esignageIpcamModel: Model<EsignageIpcamDocument>,

    @InjectModel(EsignageWeather.name)
    private readonly esignageWeatherModel: Model<EsignageWeatherDocument>,
    @InjectModel(EsignageMediaPool.name)
    private readonly esignageMediaPoolModel: Model<EsignageMediaPoolDocument>,
    @InjectModel(EsignageSchedule.name)
    private readonly esignageScheduleModel: Model<EsignageScheduleDocument>,
    @InjectModel(EsignageScheduleLogs.name)
    private readonly esignageScheduleLogsModel: Model<EsignageScheduleLogsDocument>,
    @InjectModel(EsignageTemplateLogs.name)
    private readonly esignageTemplateLogsModel: Model<EsignageTemplateLogsDocument>,
    @InjectModel(EsignageTemplateContentLogs.name)
    private readonly esignageTemplateContentLogsModel: Model<EsignageTemplateContentLogsDocument>,
    @InjectModel(EsignageTemplateContentDetailLogs.name)
    private readonly esignageTemplateContentDetailLogsModel: Model<EsignageTemplateContentDetailLogsDocument>,
    @InjectModel(EsignageTemplateType.name)
    private readonly esignageTemplateTypeModel: Model<EsignageTemplateTypeDocument>,
    @InjectModel(EsignageWeatherStyle.name)
    private readonly esignageWeatherStyleModel: Model<EsignageWeatherStyleDocument>,
    @InjectModel(LanguageCode.name)
    private readonly languageCodeModel: Model<LanguageCodeDocument>,
    @InjectModel(City.name)
    private readonly cityModel: Model<CityDocument>,
    @InjectModel(EsignageContentType.name)
    private readonly esignageContentTypeModel: Model<EsignageContentTypeDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => DeviceService))
    private deviceService: DeviceService,
    @Inject(forwardRef(() => GroupService))
    private groupService: GroupService,
    private chtiotClientService: ChtiotClientService,
    private configService: ConfigService,
    private googleClientService: GoogleClientService,
  ) {}

  // query
  async getDivision(groupId: string): Promise<DivisionOutput[]> {
    const ids = await this.groupService.getAllChilds(
      new Types.ObjectId(groupId),
      true,
    );
    const divisionList: DivisionOutput[] = [];
    for (const id of ids) {
      const division = new DivisionOutput();
      const group = await this.groupService.getGroup(id.toString());
      division.id = group.id;
      division.groupName = group.name;
      divisionList.push(division);
    }
    const ownGroup = divisionList[0];
    console.log(divisionList);
    divisionList.sort((a, b) => {
      const fa = a.groupName.toLowerCase();
      const fb = b.groupName.toLowerCase();
      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    const newDivisionList = divisionList.filter(
      (a) => a.groupName != ownGroup.groupName,
    );
    newDivisionList.unshift(ownGroup);

    return newDivisionList;
  }

  async getTemplateType(
    page: number,
    pageSize: number,
    _filter: Filter,
  ): Promise<EsignageTemplateTypeOutput[]> {
    const templateTypeResolution: EsignageTemplateTypeOutput[] =
      await this.esignageTemplateTypeModel.aggregate([
        {
          $lookup: {
            from: 'esignage_resolution',
            localField: 'resolutionId',
            foreignField: '_id',
            as: 'TemplateTypeResolution',
          },
        },
        { $unwind: '$TemplateTypeResolution' },
        {
          $project: {
            // _id: 1,
            id: '$_id',
            typeName: 1,
            description: 1,
            templateImagePath_Light: 1,
            templateImagePath_Dark: 1,
            status: 1,
            resolution: '$TemplateTypeResolution.name',
          },
        },
        { $sort: { typeName: 1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]);
    return templateTypeResolution;
  }

  async getTemplateTypeCount(): Promise<number> {
    const totalCount = await this.esignageTemplateTypeModel.countDocuments();
    return totalCount;
  }

  async getTemplate(
    groupId: string,
    page: number,
    pageSize: number,
    _filter: Filter,
  ): Promise<TemplateOutput[]> {
    const ids = await this.groupService.getAllChilds(
      new Types.ObjectId(groupId),
      true,
    );
    console.log(ids.toString());
    const template: TemplateOutput[] =
      await this.esignageTemplateModel.aggregate([
        { $match: { group: { $in: ids } } },
        {
          $lookup: {
            from: 'esignage_template_type',
            localField: 'templateTypeId',
            foreignField: '_id',
            as: 'TemplateType',
          },
        },
        { $unwind: '$TemplateType' },
        {
          $lookup: {
            from: 'esignage_resolution',
            localField: 'TemplateType.resolutionId',
            foreignField: '_id',
            as: 'TemplateTypeResolution',
          },
        },
        { $unwind: '$TemplateTypeResolution' },
        {
          $lookup: {
            from: 'groups',
            localField: 'group',
            foreignField: '_id',
            as: 'TemplateGroup',
          },
        },
        { $unwind: '$TemplateGroup' },
        {
          $project: {
            id: '$_id',
            name: 1,
            description: 1,
            backgroundColor: 1,
            group: 1,
            groupName: '$TemplateGroup.name',
            templateTypeId: 1,
            typeName: '$TemplateType.typeName',
            typeResolution: '$TemplateTypeResolution.name',
          },
        },
        { $sort: { name: 1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]);
    return template;
  }

  async getTemplateByTemplateId(
    templateId: ObjectId,
  ): Promise<EsignageTemplate> {
    const template = this.esignageTemplateModel.findOne({
      _id: templateId,
    });
    return template;
  }

  async getTemplateCount(groupId: string): Promise<number> {
    const ids = await this.groupService.getAllChilds(
      new Types.ObjectId(groupId),
      true,
    );
    console.log(ids.toString());
    const totalCount: TemplateCount[] =
      await this.esignageTemplateModel.aggregate([
        { $match: { group: { $in: ids } } },
        {
          $lookup: {
            from: 'esignage_template_type',
            localField: 'templateTypeId',
            foreignField: '_id',
            as: 'TemplateType',
          },
        },
        { $unwind: '$TemplateType' },
        {
          $lookup: {
            from: 'esignage_resolution',
            localField: 'TemplateType.resolutionId',
            foreignField: '_id',
            as: 'TemplateTypeResolution',
          },
        },
        { $unwind: '$TemplateTypeResolution' },
        {
          $lookup: {
            from: 'groups',
            localField: 'group',
            foreignField: '_id',
            as: 'TemplateGroup',
          },
        },
        { $unwind: '$TemplateGroup' },
        {
          $project: {
            id: '$_id',
            name: 1,
            description: 1,
            backgroundColor: 1,
            group: 1,
            groupName: '$TemplateGroup.name',
            typeName: '$TemplateType.typeName',
            typeResolution: '$TemplateTypeResolution.name',
          },
        },
        { $count: 'templateCount' },
      ]);
    return totalCount[0].templateCount;
  }

  async getTemplateContent(templateId: string): Promise<EsignageTemplate> {
    const tempId = new Types.ObjectId(templateId);
    const [template]: EsignageTemplate[] =
      await this.esignageTemplateModel.find({
        _id: tempId,
      });
    return template;
  }

  async getContentByTemplateId(
    templateId: string,
  ): Promise<EsignageTemplateContent[]> {
    const tempId = new Types.ObjectId(templateId);
    const templateContent: EsignageTemplateContent[] =
      await this.esignageTemplateContentModel.find({ templateId: tempId });
    return templateContent;
  }

  async getContentDetailByContentId(
    contentId: string,
  ): Promise<EsignageTemplateContentDetail> {
    const contentID = new Types.ObjectId(contentId);
    const [contentDetail]: EsignageTemplateContentDetail[] =
      await this.esignageTemplateContentDetailModel.find({
        contentId: contentID,
      });
    console.log(contentDetail);
    return contentDetail;
  }

  async getWeatherDetailByWeatherId(
    weatherId: string,
  ): Promise<EsignageWeather> {
    const weatherID = new Types.ObjectId(weatherId);
    const [weatherDetail]: EsignageWeather[] =
      await this.esignageWeatherModel.find({ _id: weatherID });
    return weatherDetail;
  }

  async getWebpageDetailByWebpageId(
    webPageId: string,
  ): Promise<EsignageWebpage> {
    const webID = new Types.ObjectId(webPageId);
    const [webDetail]: EsignageWebpage[] = await this.esignageWebpageModel.find(
      { _id: webID },
    );
    return webDetail;
  }

  async getCamDetailByCamId(camId: string): Promise<EsignageIpcam> {
    const webID = new Types.ObjectId(camId);
    const [cam]: EsignageIpcam[] = await this.esignageIpcamModel.find({
      _id: webID,
    });
    return cam;
  }

  // async getMediaDetailByMediaId(mediaId: string): Promise<EsignageMediaPool> {
  //   const mediaID = new Types.ObjectId(mediaId);
  //   const [media]: EsignageMediaPool[] = await this.esignageMediaPoolModel.find(
  //     {
  //       mediaId: mediaID,
  //     },
  //   );
  //   return media;
  // }

  async getWeatherStyle(
    page: number,
    pageSize: number,
  ): Promise<WeatherStyleOutput[]> {
    const weatherStyleList: WeatherStyleOutput[] =
      await this.esignageWeatherStyleModel
        .find()
        .skip((page - 1) * pageSize)
        .limit(pageSize);
    return weatherStyleList;
  }

  async getLanguageCode(
    page: number,
    pageSize: number,
  ): Promise<LanguageOutput[]> {
    const languageList: LanguageOutput[] = await this.languageCodeModel
      .find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    return languageList;
  }

  async getCity(page: number, pageSize: number): Promise<CityOutput[]> {
    const cityList: CityOutput[] = await this.cityModel
      .find()
      .sort({ region: 1 })
      .sort({ cityName: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    return cityList;
  }

  async getContentType(
    page: number,
    pageSize: number,
  ): Promise<ContentTypeOutput[]> {
    const contentTypeList: ContentTypeOutput[] =
      await this.esignageContentTypeModel
        .find()
        .skip((page - 1) * pageSize)
        .limit(pageSize);
    return contentTypeList;
  }

  async getWeatherStyleCount(): Promise<number> {
    const totalCount = await this.esignageWeatherStyleModel.countDocuments();
    return totalCount;
  }

  async getLanguageCount(): Promise<number> {
    const totalCount = await this.languageCodeModel.countDocuments();
    return totalCount;
  }

  async getCityCount(): Promise<number> {
    const totalCount = await this.cityModel.countDocuments();
    return totalCount;
  }

  async getContentTypeCount(): Promise<number> {
    const totalCount = await this.esignageContentTypeModel.countDocuments();
    return totalCount;
  }

  async getContentBytemplateId(
    templateId: string,
  ): Promise<EsignageTemplateContent[]> {
    return this.esignageTemplateContentModel.find({
      templateId: new Types.ObjectId(templateId),
    });
  }

  async addTemplate(esignageTemplate: EsignageTemplate): Promise<string> {
    // const session = await this.esignageTemplateModel.startSession();
    // try {
    //   session.startTransaction();
    //   const res = await this.esignageTemplateModel.create([esignageTemplate], {
    //     session,
    //   });
    //   await session.commitTransaction();
    //   console.log('success');
    // } catch (error) {
    //   console.log('create template error');
    //   await session.abortTransaction();
    // }
    // void session.endSession();
    const res = await this.esignageTemplateModel.create(esignageTemplate);
    const templateId = String(res.id);
    return templateId;
  }

  /**
   * mutation zone
   */

  async addTemplateLogs(
    esignageTemplateLogs: EsignageTemplateLogs,
  ): Promise<string> {
    const res = await this.esignageTemplateLogsModel.create(
      esignageTemplateLogs,
    );
    const logsId = String(res.id);
    return logsId;
  }

  async addTemplateContent(
    esignageTemplateContent: EsignageTemplateContent,
  ): Promise<string> {
    const res = await this.esignageTemplateContentModel.create(
      esignageTemplateContent,
    );
    const templateContentId = String(res.id);
    return templateContentId;
  }

  async addTemplateContentLogs(
    esignageTemplateContentLogs: EsignageTemplateContentLogs,
  ): Promise<string> {
    const res = await this.esignageTemplateContentLogsModel.create(
      esignageTemplateContentLogs,
    );
    const logsId = String(res.id);
    return logsId;
  }

  async addTemplateContentDetail(
    esignageTemplateContentDetail: EsignageTemplateContentDetail,
  ): Promise<string> {
    const res = await this.esignageTemplateContentDetailModel.create(
      esignageTemplateContentDetail,
    );
    const templateContentDetailId = String(res.id);
    if (
      templateContentDetailId === null ||
      templateContentDetailId == undefined
    ) {
      throw new ApolloError(
        `ADD ESignage template faile`,
        ErrorCode.ESIGNAGNE_ADD_TEMPLATE_CONTENT_DETAIL_FAILE,
      );
    }
    return templateContentDetailId;
  }

  async addTemplateContentDetailLogs(
    esignageTemplateContentDetailLogs: EsignageTemplateContentDetailLogs,
  ): Promise<string> {
    const res = await this.esignageTemplateContentDetailLogsModel.create(
      esignageTemplateContentDetailLogs,
    );
    const logsId = String(res.id);
    return logsId;
  }

  async addWeather(weather: EsignageWeather): Promise<string> {
    const res = await this.esignageWeatherModel.create(weather);
    const weatherId = String(res.id);
    return weatherId;
  }

  async addMediaPool(mediaPool: EsignageMediaPool): Promise<string> {
    const res = await this.esignageMediaPoolModel.create(mediaPool);
    const mediaPoolId = String(res.id);
    return mediaPoolId;
  }

  async addWebPage(webpage: EsignageWebpage): Promise<string> {
    const res = await this.esignageWebpageModel.create(webpage);
    const webPageId = String(res.id);
    return webPageId;
  }

  async addIpCam(ipCam: EsignageIpcam): Promise<string> {
    const res = await this.esignageIpcamModel.create(ipCam);
    const ipCamId = String(res.id);
    return ipCamId;
  }

  async deleteTemplate(templateId: ObjectId): Promise<boolean> {
    await this.esignageTemplateModel.deleteOne({ _id: templateId });
    return true;
  }

  async deleteWeather(weatherId: ObjectId): Promise<boolean> {
    await this.esignageWeatherModel.deleteOne({ _id: weatherId });
    return true;
  }

  async deleteMedia(mediaId: ObjectId): Promise<boolean> {
    await this.esignageMediaPoolModel.deleteOne({ mediaId: mediaId });
    return true;
  }

  async deleteWebPage(webPageId: ObjectId): Promise<boolean> {
    await this.esignageWebpageModel.deleteOne({ _id: webPageId });
    return true;
  }

  async deleteIpCam(ipCamId: ObjectId): Promise<boolean> {
    await this.esignageIpcamModel.deleteOne({ _id: ipCamId });
    return true;
  }

  async deleteContentDetail(contentDetailId: ObjectId): Promise<boolean> {
    await this.esignageTemplateContentDetailModel.deleteOne({
      _id: contentDetailId,
    });
    return true;
  }

  async deleteContent(contentId: ObjectId): Promise<boolean> {
    await this.esignageTemplateContentModel.deleteOne({
      _id: contentId,
    });
    return true;
  }

  async updateTemplate(
    templateId: string,
    templateInput: UpdateTemplateInput,
  ): Promise<boolean> {
    const templateID = new Types.ObjectId(templateId);
    if (templateInput) {
      await this.esignageTemplateModel.findByIdAndUpdate(templateID, {
        $set: {
          name: templateInput.name,
          templateTypeId: new Types.ObjectId(templateInput.templateTypeId),
          description: templateInput.description,
          backgroundColor: templateInput.backgroundColor,
          group: new Types.ObjectId(templateInput.group),
        },
      });
    }
    return true;
  }

  async updateTemplateContent(
    contentId: string,
    updateTemplateContent: UpdateTemplateContent,
  ): Promise<boolean> {
    const contentID = new Types.ObjectId(contentId);
    if (updateTemplateContent) {
      await this.esignageTemplateContentModel.findByIdAndUpdate(contentID, {
        $set: {
          contentTypeId: updateTemplateContent.contentTypeId,
          contentName: updateTemplateContent.contentName,
          tag: updateTemplateContent.tag,
          x: updateTemplateContent.x,
          y: updateTemplateContent.y,
          width: updateTemplateContent.width,
          height: updateTemplateContent.height,
        },
      });
    }
    return true;
  }

  async updateTemplateContentDetailByWeather(
    contentId: string,
    weatherId: string,
  ): Promise<boolean> {
    const contentID = new Types.ObjectId(contentId);
    if (weatherId) {
      await this.esignageTemplateContentDetailModel.findOneAndUpdate(
        { contentId: contentID },
        {
          $set: {
            weatherId: weatherId,
          },
        },
      );
    }
    return true;
  }

  async updateTemplateContentDetailByIpcam(
    contentId: string,
    ipcamId: string[],
  ): Promise<boolean> {
    const contentID = new Types.ObjectId(contentId);
    if (ipcamId.length > 0) {
      await this.esignageTemplateContentDetailModel.findOneAndUpdate(
        { contentId: contentID },
        {
          $set: {
            camIds: ipcamId,
          },
        },
      );
    }
    return true;
  }

  async updateTemplateContentDetailByWebpage(
    contentId: string,
    webpageId: string[],
  ): Promise<boolean> {
    const contentID = new Types.ObjectId(contentId);
    if (webpageId.length > 0) {
      await this.esignageTemplateContentDetailModel.findOneAndUpdate(
        { contentId: contentID },
        {
          $set: {
            webPageIds: webpageId,
          },
        },
      );
    }
    return true;
  }

  async updateTemplateContentDetailByMedia(
    contentId: string,
    mediaId: string[],
  ): Promise<boolean> {
    const contentID = new Types.ObjectId(contentId);
    if (mediaId.length > 0) {
      await this.esignageTemplateContentDetailModel.findOneAndUpdate(
        { contentId: contentID },
        {
          $set: {
            mediaIds: mediaId,
          },
        },
      );
    }
    return true;
  }
}
