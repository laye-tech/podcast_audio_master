import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../security/constant';
import { JwtStrategy } from './jwt.strategy';


@Module({
  imports:[
    forwardRef(() =>
      JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '72000s' }, // 10000s = 2heures // 14400s = 4heures // 72000s = 20heures
      }),
    ),
    UsersModule],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy]
})
export class AuthModule {}
