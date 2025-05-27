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
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PodcastService } from './podcast.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PodcastDto } from './DtoPodcast/podcast.dto';
import { Category } from 'src/category/Entities/category.entities';

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
/**
 * 
 * @param dto 
 * @param file 
 * @param req 
 * @returns 
 */
  @Post('/createPodcast')
   @ApiOperation({ summary: 'Creér un podcast' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          libelle: { type: 'string', example: 'nom du podcast' },
          description: { type: 'string', example: 'Description sympa' },
          category_uuid: { type: 'string', example: 'cles primaire de la category ' },
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @ApiResponse({ status: 200, description: 'Podcast crée avec succes', type: Podcast })
    @ApiResponse({ status: 404, description: 'Podcast non crée' })
  @UseInterceptors(FileInterceptor('file'))
  async creatUserPodcast(
    @Body() dto: PodcastDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<Podcast> {
    return this.service.createPodcast(dto, file, req.user);
  }

  /**
   * 
   * @param dto 
   * @param req 
   * @returns 
   */
    @Post('/getPodcastUuid')
    @ApiOperation({ summary: 'Récupérer un podcast par UUID' })
      @ApiBody({ type: PodcastDto, required: false }) // Si dto est partiel
      @ApiResponse({ status: 200, description: 'Podcast trouvée', type: Podcast })
      @ApiResponse({ status: 404, description: 'Podcast non trouvée' })
    async getPodcastUuid(
      @Body() dto: Partial<PodcastDto>,
      @Req() req,
    ): Promise<Podcast> {
      return this.service.getPodcastByUuid(dto, req.user);
    }

    /**
     * 
     * @param dto 
     * @param req 
     * @returns 
     */
    @Post('/getPodcastCategory')
    @ApiOperation({ summary: 'Récupérer tous les podcast d\'une categorie donnee' })
      @ApiBody({ type: PodcastDto, required: false }) // Si dto est partiel
      @ApiResponse({ status: 200, description: 'Podcast trouvée', type: Podcast })
      @ApiResponse({ status: 404, description: 'Podcast non trouvée' })
    async getPodcastCategory(
      @Body() dto: Partial<PodcastDto>,
      @Req() req,
    ): Promise<Podcast[]> {
      return this.service.getPodcastByCategorie(dto);
    }
}
