import { Crud, CrudController } from '@dataui/crud';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Playlist } from './entities/playlist.entities';
import { PlaylistService } from './playlist.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlayListDto } from './DtoPlaylist/playlist.dto';

@ApiTags('playlist')
@ApiBearerAuth('access-token')
@Crud({
  model: {
    type: Playlist,
  },
  params: {
    id: {
      type: 'string',
      primary: true,
      field: 'uuid',
    },
  },
})
@Controller('playlist')
export class PlaylistController implements CrudController<Playlist> {
  constructor(public readonly service: PlaylistService) {}

  /**
   * 
   * @param dto 
   * @param file 
   * @param req 
   * @returns 
   */
  @Post('/createPlayList')
  @ApiOperation({ summary: 'Creér une playlist' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        libelle: { type: 'string', example: 'Ma playlist' },
        description: { type: 'string', example: 'Description sympa' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Playlist crée', type: Playlist })
  @ApiResponse({ status: 404, description: 'Playlist non crée' })
  @UseInterceptors(FileInterceptor('file'))
  async creatUserPlayList(
    @Body() dto: PlayListDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<Playlist> {
    return this.service.createPlayList(dto, file, req.user);
  }

  /**
   * 
   * @param dto 
   * @param req 
   * @returns 
   * l'utilisation du post me permet de bien passer un body dans la documentation du swagger .
   * Si c'est un Get il faut passer le query ou param
   * Mais ce qui est interessant  un post retourne une valeur ,je suis bon
   */
  @Post('/getPlayListUuid')
  @ApiOperation({ summary: 'Récupérer une playlist par UUID' })
  @ApiBody({ type: PlayListDto, required: false }) // Si dto est partiel
  @ApiResponse({ status: 200, description: 'Playlist trouvée', type: Playlist })
  @ApiResponse({ status: 404, description: 'Playlist non trouvée' })
  async getPlayListUuid(
    @Body() dto: Partial<PlayListDto>,
    @Req() req,
  ): Promise<Playlist> {
    return this.service.getPlayListByUuid(dto, req.user);
  }

  /**
   * 
   * @param req 
   * @returns 
   */
  @Get('/getPlayAllListOwn')
  @ApiOperation({ summary: 'Récupérer tous les playlist d\'un l\'utilisateur ' })
  @ApiResponse({ status: 200, description: 'Playlist trouvée', type: Playlist })
  @ApiResponse({ status: 404, description: 'Playlist non trouvée' })
  async getPlayListOwnByUser(
    @Req() req,
  ): Promise<Playlist[]> {
    return this.service.getAllPlayListOwnByuser(req.user);
  }
}
