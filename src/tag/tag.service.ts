import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Tag } from './entities/tag.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TagService extends TypeOrmCrudService<Tag> {

     private logger: Logger
       
    
        constructor(
            @InjectRepository(Tag)
            private readonly tagRepository: Repository<Tag>,
           
            private readonly configService: ConfigService
    
    
        ) {
            super(tagRepository)
            this.logger = new Logger(TagService.name)
        }
}
