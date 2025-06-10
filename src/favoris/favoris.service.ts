import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { FavoriUser } from './entities/favoris.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { EpisodeService } from 'src/episode/episode.service';
import { FavoriUserDto } from './DtoFavoris/favoris.dto';
import { Users } from 'src/users/entities/users.entity';

@Injectable()
export class FavorisService extends TypeOrmCrudService<FavoriUser>{
     private logger: Logger;
      constructor(
        @InjectRepository(FavoriUser)
        private readonly favoryRepository: Repository<FavoriUser>,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly episodeService: EpisodeService,
      ) {
        super(favoryRepository);
        this.logger = new Logger(FavorisService.name);
      }
    
      /**
       * Pemet de creer des favoris
       * Je m'ennui quand meme ,sache que je t'aime Sala ❤️❤️❤️❤️❤️❤️ ###laye_tech
       * @param playlistUser
       * @param userConnected
       * @returns
       */
      async createFavorisUser(
        favorisUser: FavoriUserDto,
        userConnected: Omit<Users, 'password_hash'>,
      ): Promise<FavoriUser> {
        const { login, firstname, name, email, profileImgPath } = userConnected;
    
        this.logger.log(
          `-> 🚩 Creating New favori for User [${firstname} - ${name}] ⚠️...`,
        );
    
        let [userPlayList, episode] = await Promise.all([
          this.usersService.findOneBy({
            login: login,
          }),
          this.episodeService.findOneBy({
            uuid: favorisUser.episode_uuid,
          })
       
        ]);
    
        if (!userPlayList || !episode )
          throw new ConflictException(
            "L'utilisateur ou l'episode n'existe pas ",
          );
        this.logger.log(
          `-> 🚩 User [${userPlayList.name} - ${userPlayList.firstname}]found in database `,
        );
    
        this.logger.log(
          `-> 🚩 Episode [${episode.libelle} - ${episode.description}]found in database `,
        );
    
        favorisUser.episode = episode;
        favorisUser.user_id = userPlayList.id;
    
        this.logger.log(
          `-> 🚩 Starting save in database : [${JSON.stringify(favorisUser)}] `,
        );
    
        return await this.favoryRepository
          .save(favorisUser)
          .then(async (newFavoriUser: FavoriUser) => {
            this.logger.log(`-> Successfuly save in database`);
            return newFavoriUser;
          });
      }
    
      
}
