import { Crud, CrudController } from '@dataui/crud';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Tag } from './entities/tag.entities';
import { TagService } from './tag.service';


@ApiTags('Category')
@Crud({
    model: {
        type: Tag,
    },
    params: {
        uuid: {
            type: 'string',
            primary: true,
            field: 'uuid',
        },
    },
})
@Controller('tag')
export class TagController implements CrudController<Tag> {
    constructor(public service: TagService) {

    }
}
