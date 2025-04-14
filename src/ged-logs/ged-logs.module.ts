import { Module } from '@nestjs/common';
import { GedLogsService } from './ged-logs.service';
import { GedLogsController } from './ged-logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GedLogs } from './entities/ged-logs.entities';

@Module({
  imports: [TypeOrmModule.forFeature([GedLogs])],
  providers: [GedLogsService],
  controllers: [GedLogsController],
  exports: [GedLogsService,TypeOrmModule]

})
export class GedLogsModule { }
