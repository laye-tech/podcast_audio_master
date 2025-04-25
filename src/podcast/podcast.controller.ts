import {
  CreateManyDto,
  Crud,
  CrudController,
  CrudRequest,
  CrudService,
  GetManyDefaultResponse,
  Override,
} from '@dataui/crud';
import { Podcast } from './entities/podcast.entities';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PodcastService } from './podcast.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PodcastDto } from './DtoPodcast/podcast.dto';

@ApiTags('podcast')
@ApiBearerAuth('access-token')
@Crud({
  model: {
    type: Podcast,
  },
  params: {
    id: {
      type: 'string',
      primary: true,
      field: 'uuid',
    },
  },
})
@Controller('podcast')
export class PodcastController implements CrudController<Podcast> {
  constructor(public readonly service: PodcastService) {}

  @Post('/createPodcast')
  @UseInterceptors(FileInterceptor('file'))
  async creatUserPodcast(
    @Body() dto: PodcastDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<Podcast> {
    return this.service.createPodcast(dto, file, req.user);
  }

    @Get('/getPodcastUuid')
    async getPodcastUuid(
      @Body() dto: Partial<PodcastDto>,
      @Req() req,
    ): Promise<Podcast> {
      return this.service.getPodcastByUuid(dto, req.user);
    }

    
    @Get('/getPodcastCategory')
    async getPodcastCategory(
      @Body() dto: Partial<PodcastDto>,
      @Req() req,
    ): Promise<Podcast[]> {
      return this.service.getPodcastByCategorie(dto, req.user);
    }
}
