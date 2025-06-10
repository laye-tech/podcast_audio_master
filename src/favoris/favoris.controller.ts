import { Crud, CrudController } from '@dataui/crud';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { FavoriUser } from './entities/favoris.entities';
import { FavorisService } from './favoris.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FavoriUserDto } from './DtoFavoris/favoris.dto';

@ApiTags('favoris-User')
@ApiBearerAuth('access-token')
@Crud({
  model: {
    type: FavoriUser,
  },
  params: {
    id: {
      type: 'string',
      primary: true,
      field: 'uuid',
    },
  },
})
@Controller('favoris')
export class FavorisController implements CrudController<FavoriUser>{
    constructor(public readonly service: FavorisService) {}

      @Post('/createFavori')
      @ApiOperation({
        summary: "Creér un favori pour un utilisateur",
      })
      @ApiBody({ type: FavoriUserDto, required: false }) // Si dto est partiel
      @ApiResponse({
        status: 200,
        description: 'Creation effectue avec succes',
        type: FavoriUser,
      })
      @ApiResponse({
        status: 404,
        description: "Erreur dans la creation ",
      })
      async creatUserFavori(
        @Body() dto: FavoriUserDto,
        @Req() req,
      ): Promise<FavoriUser> {
        return this.service.createFavorisUser(dto, req.user);
      }
}
