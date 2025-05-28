import {
  CreateManyDto,
  Crud,
  CrudController,
  CrudRequest,
  CrudService,
  GetManyDefaultResponse,
  Override,
} from '@dataui/crud';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Users } from './entities/users.entity';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.routes.decorators';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Crud({
  model: {
    type: Users,
  },
  params: {
    id: {
      type: 'number',
      primary: true,
      field: 'id',
    },
  },

  query: {
    exclude: ['password'],
  },
})
@Controller('users')
export class UsersController implements CrudController<Users> {
  constructor(public readonly service: UsersService) {}

  @Public()
  @Post('/createUser')
  @ApiOperation({ summary: 'Creér un utilisateur' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        login: {
          type: 'string',
          example: "Mettre un log de connexion exemple :fari ou 2050 ou Vito",
        },
        firstname: { type: 'string', example: 'Mettre ton prenom' },
        name: { type: 'string', example: 'Mettre ton nom' },
        email: { type: 'string', example: 'Mettre ton email' },
        password_hash: {
          type: 'string',
          example:
            'Mettre ton mot de passe avec des caracteres Maj et Minuscule exemple:FARi2810@',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Utilisateurs crée', type: Users })
  @ApiResponse({ status: 404, description: 'Utilisateurs non crée' })
  @UseInterceptors(FileInterceptor('file'))
  async creatUserPodcast(
    @Body() dto: UserDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<Users> {
    return this.service.createUserPodcast(dto, file, req.user);
  }

  @Post('/getUser')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son Login' })
  @ApiBody({ type: UserDto, required: false }) // Si dto est partiel
  @ApiResponse({ status: 200, description: 'Utilisateur trouvée', type: Users })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvée' })
  async getUserPodcast(
    @Body() dto: Partial<UserDto>,
    @Req() req,
  ): Promise<Users> {
    return this.service.getUserPodcast(dto, req.user);
  }
}
