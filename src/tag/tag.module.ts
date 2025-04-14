import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entities';

@Module({
  imports:[TypeOrmModule.forFeature([Tag])],
  exports:[TagService],
  controllers: [TagController],
  providers: [TagService]
})
export class TagModule {}
