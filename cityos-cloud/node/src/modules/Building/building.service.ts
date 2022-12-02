import { DeviceService } from '../device/device.service';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DeviceStatus,
  DeviceType,
  GetBuilding,
  DeviceFilter,
  BuildingInput,
  BuildingEdge,
  GPSPoint,
} from 'src/graphql.schema';
import { GroupService } from '../group/group.service';
import { ApolloError } from 'apollo-server-express';
import { ErrorCode } from 'src/models/error.code';
import { UserService } from '../user/user.service';
import { ChtiotClientService } from '../chtiot-client/chtiot-client.service';
import {
  Building,
  GeoJSON,
  Attribute,
  BuildingDocument,
} from 'src/models/device';
import { ConfigService } from '@nestjs/config';
import { GoogleClientService } from '../google-client/google-client/google-client.service';
import { User } from 'src/models/user';

@Injectable()
export class BuildingService {
  constructor(
    @InjectModel(Building.name)
    private readonly buildingModel: Model<BuildingDocument>,
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

  private readonly logger = new Logger(BuildingService.name);

  async getBuildings(
    groupId: string,
    filter: DeviceFilter,
  ): Promise<GetBuilding> {
    //let queryAfterLimit;
    const ids = await this.groupService.getAllChilds(
      new Types.ObjectId(groupId),
      true,
    );
    let filterCondition = {};
    filterCondition = {
      $and: [
        filter && filter.deviceId != undefined
          ? {
              groups: { $in: ids },
              type: DeviceType.BUILDING,
              deviceId: filter.deviceId,
            }
          : { groups: { $in: ids }, type: DeviceType.BUILDING },
      ],
    };

    // if (filter && filter.deviceId != undefined) {
    //   queryAfterLimit = await this.buildingModel
    //     .find({
    //       type: DeviceType.BUILDING,

    //     })
    //     .populate({ path: 'groups', model: Group })
    //     .exec();
    // }
    // else {
    const queryAfterLimit = await this.buildingModel
      .find(filterCondition)
      .populate({ path: 'groups' })
      .populate({ path: 'floors.devices' })
      // .populate({
      //   path: 'floors',
      //   model: Floor.name,
      //   populate: {
      //     path: 'floors.devices',
      //     populate: { path: 'groups' },
      //   },
      // })

      .exec();
    //}
    const responseGetBuilding = new GetBuilding();
    const edges: BuildingEdge[] = [];

    for (const build of queryAfterLimit) {
      const edge = new BuildingEdge();
      edge.node = build.toApolloBuilding();
      let countTotalDevice = 0;
      console.log('---floor:', edge.node);
      // if (edge.node.floors) {
      edge.node.floors.flatMap((it) => {
        if (it.devices) {
          countTotalDevice += it.devices.length;
        }

        return countTotalDevice;
      });
      // }
      edge.deviceCount = countTotalDevice;
      edges.push(edge);
    }
    responseGetBuilding.edges = edges;
    // Tell user the possible rectangle on the map if they do not provide the gpsRectInput
    return responseGetBuilding;
  }

  async getLatLonByAddress(address: string): Promise<GPSPoint> {
    const addressresult = await this.googleClientService.getLatLonByAddress1(
      address,
    );

    // Tell user the possible rectangle on the map if they do not provide the gpsRectInput

    return addressresult;
  }

  async createBuilding(
    user: User,
    groupId: string,
    projectKey: string,
    buildingInput: BuildingInput,
  ): Promise<string> {
    //chech input value
    if (!this.isValidBuildingInput(buildingInput)) {
      throw new ApolloError(
        'Please check the length of your inputs or device name is not empty.',
        ErrorCode.INPUT_PARAMETERS_INVALID,
      );
    }

    if (
      buildingInput.buildingType == undefined ||
      buildingInput.buildingType == null
    ) {
      buildingInput.buildingType = 'APARTMENT';
    }
    const attributes = new Attribute();
    const o1 = { key: 'device_type', value: 'building' };
    const o2 = { key: 'building_type', value: buildingInput.buildingType };
    const o3 = { key: 'x', value: buildingInput.x };
    const o4 = { key: 'y', value: buildingInput.y };
    const o5 = { key: 'degree', value: buildingInput.degree };
    attributes[0] = o1;
    attributes[1] = o2;
    attributes[2] = o3;
    attributes[3] = o4;
    attributes[4] = o5;

    // create device info in the CHT IOT platform
    const res = await this.chtiotClientService.createDevice(
      projectKey,
      buildingInput,
      attributes,
    );
    if (
      res.id == null ||
      res.id == undefined ||
      res == null ||
      res == undefined
    ) {
      throw new ApolloError(
        'Create fail:CHIIoT save error!',
        ErrorCode.CHTIOT_API_ERROR,
      );
    }
    const deviceId = res.id;

    const getTimezone = await this.googleClientService.getTimeZone(
      buildingInput.location.lat,
      buildingInput.location.lng,
    );
    const groupIdArray = [];
    groupIdArray.push(groupId);

    const floorArray = [];
    floorArray.push(buildingInput.floors);

    const att = [];
    att.push(attributes[0]);
    att.push(attributes[1]);
    att.push(attributes[2]);
    att.push(attributes[3]);
    att.push(attributes[4]);

    const newDevice = new Building();
    newDevice.deviceId = deviceId;
    newDevice.name = buildingInput.name;
    newDevice.desc = buildingInput.desc;
    newDevice.uri = '';
    newDevice.sensors = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    newDevice.groups = groupIdArray;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    newDevice.attributes = att;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    newDevice.floors = floorArray[0];
    if (buildingInput.location.lng && buildingInput.location.lat) {
      const location = new GeoJSON();
      const coordinates = [
        buildingInput.location.lng,
        buildingInput.location.lat,
      ];
      location.coordinates = coordinates;
      // ignore the invalid coordinates
      if (location.isValidCoordinates()) {
        newDevice.location = location;
      }
    }
    await Promise.all(
      this.getAddressLanguages().flatMap(async (language) => {
        const address = await this.googleClientService.addressLookup(
          language,
          buildingInput.location.lat,
          buildingInput.location.lng,
        );
        if (address !== null) newDevice.address.push(address);
        return true;
      }),
    );
    newDevice.type = DeviceType.BUILDING;
    newDevice.status = DeviceStatus.ACTIVE;
    newDevice.timezone = getTimezone;
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    console.log('add device' + newDevice);
    const buildingModel = await this.buildingModel.create(newDevice);
    if (!buildingModel) {
      await this.deviceService.deleteDevices(projectKey, groupId, [deviceId]);
      // const errorlog = new ErrorLog(
      //   user,
      //   UserEvent.ADD_BUILDING_ERROR,
      //   groupId,
      //   [deviceId],
      //   'add building error',
      // );
      // await this.errorlogService.insertEvent(errorlog);
      // throw new ApolloError(
      //   'The devices you provided is invalid. Please try again later.',
      //   ErrorCode.INPUT_DEVICES_INVALID,
      // );
    }
    return newDevice.deviceId;
  }

  async updateBuilding(
    groupId: string,
    deviceId: string,
    projectKey: string,
    buildingInput: BuildingInput,
  ): Promise<boolean> {
    if (!this.isValidBuildingInput(buildingInput)) {
      throw new ApolloError(
        'Please check the length of your inputs or device name is not empty.',
        ErrorCode.INPUT_PARAMETERS_INVALID,
      );
    }
    if (
      buildingInput.buildingType == undefined ||
      buildingInput.buildingType == null
    ) {
      buildingInput.buildingType = 'APARTMENT';
    }
    const attributes = new Attribute();
    attributes[0] = { key: 'device_type', value: 'building' };
    attributes[1] = { key: 'building_type', value: buildingInput.buildingType };
    attributes[2] = { key: 'x', value: buildingInput.x };
    attributes[3] = { key: 'y', value: buildingInput.y };
    attributes[4] = { key: 'degree', value: buildingInput.degree };
    // update device info in the CHT IOT platform
    const res = await this.chtiotClientService.updateDevice(
      projectKey,
      deviceId,
      buildingInput,
      attributes,
    );

    const getTimezone = await this.googleClientService.getTimeZone(
      buildingInput.location.lat,
      buildingInput.location.lng,
    );

    const resDevice = await this.deviceService.getDeviceById(deviceId);
    const groupIdArray = [];
    for (const a of resDevice.groups) {
      groupIdArray.push(a.id);
    }

    const floorArray = [];
    floorArray.push(buildingInput.floors);

    const att = [];
    att.push(attributes[0]);
    att.push(attributes[1]);
    att.push(attributes[2]);
    att.push(attributes[3]);
    att.push(attributes[4]);

    const newDevice = new Building();
    newDevice.deviceId = deviceId;
    newDevice.name = buildingInput.name;
    newDevice.desc = buildingInput.desc;
    newDevice.uri = '';
    newDevice.sensors = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    newDevice.groups = groupIdArray;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    newDevice.attributes = att;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    newDevice.floors = floorArray[0];
    if (buildingInput.location.lng && buildingInput.location.lat) {
      const location = new GeoJSON();
      const coordinates = [
        buildingInput.location.lng,
        buildingInput.location.lat,
      ];
      location.coordinates = coordinates;
      // ignore the invalid coordinates
      if (location.isValidCoordinates()) {
        newDevice.location = location;
      }
    }

    await Promise.all(
      this.getAddressLanguages().flatMap(async (language) => {
        const address = await this.googleClientService.addressLookup(
          language,
          buildingInput.location.lat,
          buildingInput.location.lng,
        );
        if (address !== null) newDevice.address.push(address);
        return true;
      }),
    );
    newDevice.type = DeviceType.BUILDING;
    newDevice.status = DeviceStatus.ACTIVE;
    newDevice.timezone = getTimezone;

    const device = await this.deviceService.getDeviceById(deviceId);
    const deviceID = device._id;
    if (res !== null || res !== undefined) {
      await this.buildingModel.updateOne({ _id: deviceID }, newDevice);
      return true;
    }
    return false;
  }

  async deleteBuilding(
    projectKey: string,
    groupId: string,
    deviceId: string,
  ): Promise<boolean> {
    const device = await this.deviceService.getDeviceById(deviceId);
    if (device === null) {
      this.logger.warn(
        `Cannot delete the device ${deviceId} due to not existed in the database.`,
      );
      return;
    }
    await this.deviceService.deleteDevices(projectKey, groupId, [deviceId]);

    return true;
  }

  async updateFloorplan(
    deviceId: string,
    floorNum: number,
    newImageId: string,
  ): Promise<string> {
    const device = await this.buildingModel.findOne({ deviceId: deviceId });
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    console.log('--finf one device--' + device);
    const floor = device.floors;
    let index = -1;

    if (floorNum == null) {
      return 'FloorNum is error!';
    } else {
      const out = floor.filter(async function (x) {
        if (x.floorNum == floorNum) {
          index = floor.indexOf(x);
          return x;
        }
      });
      console.log('----floor filter:' + out[index].id);
      const oldImageId = out[index].id;
      const filterCondition = {
        deviceId: deviceId,
        'floors.floorNum': floorNum,
      };
      await this.buildingModel.updateOne(filterCondition, {
        $set: { 'floors.$.id': newImageId },
      });
      return oldImageId;
    }
  }

  private isValidBuildingInput(buildingInput: BuildingInput): boolean {
    if (buildingInput.name !== undefined) {
      if (
        buildingInput.name.trim() === '' ||
        buildingInput.name === null ||
        buildingInput.name.length > 255
      ) {
        return false;
      }
    }

    if (buildingInput.desc) {
      if (buildingInput.desc.length > 2000) {
        return false;
      }
    }

    return true;
  }

  private getAddressLanguages(): string[] {
    const languages = ['en'];
    const optionalLanguageString = this.configService.get<string>(
      'LANGUAGE_FOR_ADDRESSES_LOOK_UP',
    );

    if (optionalLanguageString) {
      const optionalLanguages = optionalLanguageString.split(',');
      optionalLanguages.forEach((language) => {
        languages.push(language);
      });
    }
    return languages;
  }
}
