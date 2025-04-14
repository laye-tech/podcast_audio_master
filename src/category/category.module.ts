import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './Entities/category.entities';

@Module({
  imports:[TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports:[CategoryService]
})
export class CategoryModule {}
