import { CreateManyDto, Crud, CrudController, CrudRequest, CrudService, GetManyDefaultResponse, Override } from '@dataui/crud';
import { Body, Controller, Get, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Users } from './entities/users.entity';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';


@ApiTags('Users')
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
        exclude: ['password']
    }
})
@Controller('users')
export class UsersController implements CrudController<Users> {

    constructor(
        public readonly service: UsersService
    ) { }



    @Post('/createUser')
    @UseInterceptors(FileInterceptor('file'))
    async creatUserPodcast(@Body() dto: UserDto, @UploadedFile() file: Express.Multer.File, @Req() req): Promise<Users> {
        return this.service.createUserPodcast(dto, file, req.user);
    }


    @Get('/getUser')
    async getUserPodcast(@Body() dto: Partial<UserDto>, @Req() req): Promise<Users> {
        return this.service.getUserPodcast(dto, req.user);
    }



}
