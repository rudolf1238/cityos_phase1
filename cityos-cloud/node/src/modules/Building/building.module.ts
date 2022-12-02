import { BuildingService } from './building.service';
import { BuildingResolver } from './building.resolver';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleClientModule } from '../google-client/google-client/google-client.module';
import { PermissionModule } from '../permission/permission.module';
import { LogModule } from '../log/log.module';
import { GroupModule } from '../group/group.module';
import { UserModule } from '../user/user.module';
import { DeviceModule } from '../device/device.module';
import { Building, BuildingSchema } from 'src/models/device';
import { ChtiotClientModule } from '../chtiot-client/chtiot-client.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Building.name,
        schema: BuildingSchema,
        collection: 'devices',
      },
    ]),
    forwardRef(() => GroupModule),
    forwardRef(() => UserModule),
    forwardRef(() => DeviceModule),
    GoogleClientModule,
    PermissionModule,
    DeviceModule,
    ChtiotClientModule,
    LogModule,
  ],
  providers: [BuildingResolver, BuildingService],
  exports: [BuildingService],
})
export class BuildingModule {}
