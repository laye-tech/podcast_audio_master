import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Category } from './Entities/category.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';


@Injectable()
export class CategoryService extends TypeOrmCrudService<Category> {
    private logger: Logger
   

    constructor(
        @InjectRepository(Category)
        private readonly categorieRepository: Repository<Category>,
       
        private readonly configService: ConfigService


    ) {
        super(categorieRepository)
        this.logger = new Logger(CategoryService.name)
    }
}
