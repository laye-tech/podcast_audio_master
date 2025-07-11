import { Body, Controller, Post } from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GedLogs } from './entities/ged-logs.entities';
import { GedLogsService } from './ged-logs.service';


@ApiTags('GedLogs')
@ApiBearerAuth('access-token')
@Crud({
    model: {
        type: GedLogs,
    },
    params: {
        uuid: {
            type: 'string',
            primary: true,
            field: 'uuid',
        },
    },
})
@Controller('ged-logs')
export class GedLogsController implements CrudController<GedLogs> {

    constructor(public service: GedLogsService) {


    }


}
