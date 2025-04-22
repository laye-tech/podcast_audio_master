import { Crud, CrudController } from '@dataui/crud';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Tag } from './entities/tag.entities';
import { TagService } from './tag.service';


@ApiTags('Tag')
@ApiBearerAuth('access-token')
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
