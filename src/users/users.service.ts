import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as brcypt from "bcrypt";

import { Users } from './entities/users.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { GedService } from 'src/ged/ged.service';
import { GedDto } from 'src/ged/Dto/gedDto';

@Injectable()
export class UsersService extends TypeOrmCrudService<Users> {
    private logger: Logger
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        private readonly gedService: GedService
    ) {
        super(usersRepository)
        this.logger = new Logger(UsersService.name)
    }

    async createUserPodcast(user: UserDto, file: Express.Multer.File, userConnected: any): Promise<Users> {
        this.logger.log(`-> 🚩 Creating New User [${user.login}] ⚠️...`);

        const { login, firstname, name, password_hash, email, profileImgPath } = user

        const userOcm = await this.usersRepository.findOneBy({ login: login })

        if (userOcm) throw new ConflictException("User already exist");

        const hash = await brcypt.hash(user.password_hash, 12)

        user.password_hash = hash

        return await this.usersRepository.save(user).then(async (newuser: Users) => {
            let obj: any = {
                libelle: `Image profil de l'utilisateur ${newuser.firstname}${newuser.name}`,
                categorie: "Image Utilisateur",
                fk_of_all_table: newuser.uuid,
                doc_author: userConnected
            }
            await this.gedService.saveDocumentUrl(obj, file, userConnected)
            delete newuser.password_hash;
            return newuser;
        });

    }

    async getUserPodcast(user: Partial<UserDto>, userConnected?: any): Promise<Users> {
        this.logger.log(`-> 🚩 Getting  User [${user.login}] ⚠️...`);

        const { login, firstname, name, password_hash, email, profileImgPath } = user

        const userOcm = await this.usersRepository.findOneBy({ login: login })

        if (!userOcm) throw new ConflictException("L'utilisateur nexiste pas ");


      
        let image=await this.gedService.previewDocument({uuid:userOcm.uuid},userOcm)
        console.log("image",image)
         userOcm.profileImgPath=image
        return userOcm

    }
}
  // return await this.usersRepository.save(user).then(async (newuser: Users) => {
        //     let obj: any = {
        //         libelle: `Image profil de l'utilisateur ${newuser.firstname}${newuser.name}`,
        //         categorie: "Image Utilisateur",
        //         fk_of_all_table: newuser.uuid,
        //         doc_author: userConnected
        //     }
        //     await this.gedService.saveDocumentUrl(obj, file, userConnected)
        //     delete newuser.password_hash;
        //     return newuser;
        // });
