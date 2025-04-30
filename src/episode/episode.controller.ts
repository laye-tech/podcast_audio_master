import { Body, Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { Crud, CrudController } from '@dataui/crud';
import { Episode } from './entities/episode.entities';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EpisodeDto } from './DtoEpisode/episode.dto';



@ApiTags('episode')
@ApiBearerAuth('access-token')
@Crud({
  model: {
    type: Episode
  },
  params: {
    id: {
      type: 'string',
      primary: true,
      field: 'uuid',
    },
  },
})
@Controller('episode')
export class EpisodeController implements CrudController<Episode>{

  constructor(public readonly service: EpisodeService){}


     @Post('/createEpisode')
      @UseInterceptors(FileInterceptor('file'))
      async createEpisode(
        @Body() dto: EpisodeDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req,
      ): Promise<Episode>{
        return this.service.createEpisode(dto, file, req.user);
      }

}
