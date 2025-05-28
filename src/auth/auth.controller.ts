import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthDto } from './authDto/auth.dto';
import { Public } from './decorators/public.routes.decorators';

@ApiTags('🔐 Auth • Welcome 🔐')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Post('login')
  @ApiOperation({ summary: "Se connecter   " })
  @ApiBody({ type: AuthDto, required: false }) // Si dto est partiel
  @ApiResponse({ status: 200, description: 'Episode trouvée' })
  @ApiResponse({ status: 404, description: 'Episode non trouvée' })
  login(@Body() user: AuthDto): Observable<{ access_token: string }> {
    return this.authService
      .login(user)
      .pipe(map((jwt: string) => ({ access_token: jwt })));
  }
}
