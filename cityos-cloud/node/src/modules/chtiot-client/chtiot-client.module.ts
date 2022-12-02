import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChtiotClientService } from './chtiot-client.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [ChtiotClientService],
  exports: [ChtiotClientService],
})
export class ChtiotClientModule {}
