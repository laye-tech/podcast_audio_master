import { Module } from '@nestjs/common';
import { GedService } from './ged.service';
import { GedController } from './ged.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ged } from './Entities/ged.entities';
import { GedLogsModule } from 'src/ged-logs/ged-logs.module';
import { MinioClientModule } from 'src/minio/minio.module';

@Module({
  imports:[TypeOrmModule.forFeature([Ged]),MinioClientModule,GedLogsModule],
  providers: [GedService],
  controllers: [GedController],
  exports:[GedService]
})
export class GedModule {}
