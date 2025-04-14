import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, map, Observable, switchMap } from 'rxjs';
import { Users } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './authDto/auth.dto';
const bcrypt = require('bcrypt');


@Injectable()
export class AuthService {
    constructor(private userService: UsersService,
        private jwtService: JwtService
    ) {

    }

    /**
 * Generate JWT If User creds are Good.
 * @param user -> JSON Of The User that want to connect
 * @returns JWT Token Or Wrong Creds
 */
    login(user: AuthDto): Observable<any> {
        return this.validateUser(user.login, user.password_hash).pipe(
            switchMap((user: Users) => {
                if (user) {
                    return this.generateJWT(user).pipe(map((jwt: string) => jwt));
                } else {
                    throw new HttpException(
                        {
                            status: HttpStatus.NOT_FOUND,
                            message: 'Wrong Credential.',
                        },
                        HttpStatus.NOT_FOUND,
                    );
                }
            }),
        );
    }

    /**
   * Check if users exist in db and returns it or throws an error.
   * @param login -> Users log
   * @param password -> Users Password
   * @returns User Entity in DB or Error Not Found
   */
    validateUser(login: string, password: string): Observable<any> {
        return from(
            this.userService.findOne({
                select: [
                    'login',
                    'firstname',
                    'email',
                    'profileImgPath',
                    'password_hash',
                    'accountState',
                ],
                where: [{ login: login, }],
            }),
        ).pipe(
            switchMap((user: Users) => {
                if (!user) {
                    // 418 - STATUS CODE
                    throw new HttpException(
                        {
                            status: HttpStatus.I_AM_A_TEAPOT,
                            message: 'User doesnt Exist.',
                        },
                        HttpStatus.I_AM_A_TEAPOT,
                    );
                }

                return this.comparePasswords(password, user.password_hash).pipe(
                    map((match: boolean) => {
                        if (match) {
                            const { password_hash, ...result } = user;
                            return result;
                        } else {
                            // 406 - CODE STATUS
                            throw new HttpException(
                                {
                                    status: HttpStatus.NOT_ACCEPTABLE,
                                    message: 'Wrong Credential.',
                                },
                                HttpStatus.NOT_ACCEPTABLE,
                            );
                        }
                    }),
                );
            }),
        );
    }


    generateJWT(user: Omit<Users, 'password_hash'>): Observable<any> {
        return from(this.jwtService.signAsync({ user }));
    }

    hashPassword(password: string): Observable<string> {
        return from<string>(bcrypt.hash(password, 12));
    }

    comparePasswords(newPassword: string, passwortHash: string): Observable<any> {
        return from(bcrypt.compare(newPassword, passwortHash));
    }

}
