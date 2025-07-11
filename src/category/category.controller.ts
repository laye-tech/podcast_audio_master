import { Controller } from '@nestjs/common';
import { CreateManyDto, Crud, CrudController, CrudRequest, CrudService, GetManyDefaultResponse } from '@dataui/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Category } from './Entities/category.entities';


@ApiTags('Category')
@ApiBearerAuth('access-token')
@Crud({
    model: {
        type: Category,
    },
    params: {
        uuid: {
            type: 'string',
            primary: true,
            field: 'uuid',
        },
    },
})
@Controller('category')
export class CategoryController implements CrudController<Category> {
    constructor(public service: CategoryService) {

    }



}
