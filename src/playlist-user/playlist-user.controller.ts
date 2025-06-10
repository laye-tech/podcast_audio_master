import { Crud, CrudController } from '@dataui/crud';
import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PlaylistUser } from './entities/playlistUser.entities';
import { PlaylistUserService } from './playlist-user.service';
import { PlayListUserDto } from './DtoPlaylistUser/playlistUser.dto';

@ApiTags('playlist-User')
@ApiBearerAuth('access-token')
@Crud({
  model: {
    type: PlaylistUser,
  },
  params: {
    id: {
      type: 'string',
      primary: true,
      field: 'uuid',
    },
  },
})
@Controller('playlist-user')
export class PlaylistUserController implements CrudController<PlaylistUser> {
  constructor(public readonly service: PlaylistUserService) {}

  @Post('/createEpisodePlaylist')
  @ApiOperation({
    summary: "Creér un episode pour un playlist d'un utilisateur",
  })
  @ApiBody({ type: PlayListUserDto, required: false }) // Si dto est partiel
  @ApiResponse({
    status: 200,
    description: 'Creation effectue avec succes',
    type: PlaylistUser,
  })
  @ApiResponse({
    status: 404,
    description: "Erreur dans la creation de l'episode pour le podcast",
  })
  async creatUserPlayList(
    @Body() dto: PlayListUserDto,
    @Req() req,
  ): Promise<PlaylistUser> {
    return this.service.createPlayListUser(dto, req.user);
  }

  @Post('/getAllEpisodeInPlayList')
  @ApiOperation({ summary: "Récupérer tous les episodes qui sont dans le playlist de l'utilisateur " })
  @ApiResponse({
    status: 200,
    description: 'All episode  trouvée',
    type: PlaylistUser,
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async getPlayListOwnByUser(
    @Body() dto: Partial<PlayListUserDto>,
  ): Promise<PlaylistUser[]> {
    return this.service.getAllEpisodeOfPlaylist(dto);
  }
}
