import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { Crud, CrudController } from '@dataui/crud';
import { Episode } from './entities/episode.entities';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EpisodeDto } from './DtoEpisode/episode.dto';
import { Podcast } from 'src/podcast/entities/podcast.entities';

@ApiTags('episode')
@ApiBearerAuth('access-token')
@Crud({
  model: {
    type: Episode,
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
export class EpisodeController implements CrudController<Episode> {
  constructor(public readonly service: EpisodeService) {}

  @Post('/createEpisode')
  @ApiOperation({ summary: 'Creér un épisode' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        libelle: { type: 'string', example: "nom de l'episode " },
        description: {
          type: 'string',
          example: "Description sympa de l'episode",
        },
        podcast_uuid: { type: 'string', example: 'cles primaire du podcast ' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Episode crée avec succes',
    type: Episode,
  })
  @ApiResponse({ status: 404, description: 'Episode non crée' })
  @UseInterceptors(FileInterceptor('file'))
  async createEpisode(
    @Body() dto: EpisodeDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<Episode> {
    return this.service.createEpisode(dto, file, req.user);
  }

  @Post('/getAllEpisodeBypodcastUuid')
  @ApiOperation({ summary: "Récupérer tous les episodes d'un podcast  " })
  @ApiBody({ type: EpisodeDto, required: false }) // Si dto est partiel
  @ApiResponse({ status: 200, description: 'Episode trouvée', type: Episode })
  @ApiResponse({ status: 404, description: 'Episode non trouvée' })
  async getPlayListOwnByUser(@Body() dto: Partial<EpisodeDto>): Promise<Episode[]> {
    return this.service.getAllEpisodeOwnByPodcast(dto);
  }
}
