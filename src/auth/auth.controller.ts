import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthDto } from './authDto/auth.dto';
import { Public } from './decorators/public.routes.decorators';

@ApiTags('🔐 Auth • Welcome 🔐')
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {

    }
    @Public()
    @Post('login')
    login(@Body() user: AuthDto): Observable<{ access_token: string }> {
        return this.authService
            .login(user)
            .pipe(map((jwt: string) => ({ access_token: jwt })));
    }
}
