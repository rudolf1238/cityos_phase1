import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import path, { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CameraModule } from './modules/camera/camera.module';
import { DeviceModule } from './modules/device/device.module';
import { GroupModule } from './modules/group/group.module';
import { Oauth2Module } from './modules/oauth2/oauth2.module';
import { LampModule } from './modules/lamp/lamp.module';
import { DateScalar } from './scalars/date';
import { MalDeviceModule } from './modules/maldevice/maldevice.module';
import StringUtils from './utils/StringUtils';
import { AbnormalResponseMsgModule } from './modules/Abnormal/abnormalResponseMsg.module';
import { MaintenanceStaffModule } from './modules/maintenance_staff/maintenance_staff.module';
import { BuildingModule } from './modules/Building/building.module';
import { ImageMgmtModule } from './modules/image-mgmt/image-mgmt.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BullModule } from '@nestjs/bull';
import { ChtiotClientModule } from './modules/chtiot-client/chtiot-client.module';
import { LineModule } from './modules/line/line.module';
import { AutomationModule } from './modules/automation/automation.module';
import { EmergencyCallModule } from './modules/emergency-call/emergency-call.module';
import { ESignageCMModule } from './modules/eSignageCM/eSignageCM.module';
import { WifihotspotModule } from './modules/wifihotspot/wifihotspot.module';
import { I18nModule, QueryResolver } from 'nestjs-i18n';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../env/cityos_env',
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        typePaths: ['./**/*.graphql'],
        installSubscriptionHandlers: true,
        debug: process.env.NODE_ENV !== 'production',
        playground: process.env.NODE_ENV !== 'production',
        definitions: {
          path: join(process.cwd(), './src/graphql.schema.ts'),
          outputAs: 'class',
          defaultScalarType: 'unknown',
          customScalarTypeMapping: {
            DateTime: 'Date',
          },
        },
        cors: true,
        context: ({ connection }) => ({
          connection,
        }),
        subscriptions: {
          onConnect: (connectionParams: any) => {
            return { headers: StringUtils.keysToLowerCase(connectionParams) };
          },
          path: configService.get<string>('CITYOS_API_PATH'),
        },
        path: configService.get<string>('CITYOS_API_PATH'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection: Connection) => {
          connection.plugin(require('mongoose-autopopulate'));
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        prefix: `bull-${configService.get<string>('NODE_ENV')}`,
        redis: {
          host: configService
            .get<string>('REDIS_URI')
            .replace('redis://', '')
            .split(':')[0],
          port: +configService
            .get<string>('REDIS_URI')
            .replace('redis://', '')
            .split(':')[1],
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    GroupModule,
    DeviceModule,
    LampModule,
    CameraModule,
    Oauth2Module,
    AbnormalResponseMsgModule,
    MaintenanceStaffModule,
    BuildingModule,
    MalDeviceModule,
    ScheduleModule.forRoot(),
    ImageMgmtModule,
    DashboardModule,
    ChtiotClientModule,
    LineModule,
    NotificationModule,
    AutomationModule,
    EmergencyCallModule,
    ESignageCMModule,
    WifihotspotModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en-US',
      loaderOptions: {
        path: path.join(__dirname, '../locales/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, DateScalar],
})
export class AppModule {}
