import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Episode } from './entities/episode.entities';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { GedService } from 'src/ged/ged.service';
import { ConfigService } from '@nestjs/config';
import { EpisodeDto } from './DtoEpisode/episode.dto';
import { Users } from 'src/users/entities/users.entity';
import { PodcastService } from 'src/podcast/podcast.service';
import { Ged } from 'src/ged/Entities/ged.entities';

@Injectable()
export class EpisodeService extends TypeOrmCrudService<Episode> {

      private logger: Logger;
      constructor(
        @InjectRepository(Episode)
        private readonly episodeRepository: Repository<Episode>,
        private readonly usersService: UsersService,
        private readonly gedService: GedService,
        private readonly podcastService:PodcastService,
        private readonly configService: ConfigService,
      ) {
        super(episodeRepository);
        this.logger = new Logger(EpisodeService.name);
      }


        async createEpisode(
          episode: EpisodeDto,
          file: Express.Multer.File,
          userConnected: Omit<Users, 'password_hash'>,
        ): Promise<Episode> {
          this.logger.log(`-> 🚩 Creating New Podcast [${episode.libelle}] ⚠️...`);
      
          const { login, firstname, name, email, profileImgPath } = userConnected;
      
          let [userPodcast, podcast] = await Promise.all([
            this.usersService.findOneBy({
              login: login,
            }),
            this.podcastService.findOneBy({ uuid: episode.podcast_uuid }),
          ]);
      
          if (!userPodcast || !podcast)
            throw new ConflictException(
              "L'utilisateur ou la podcast  n'existe pas ",
            );
          this.logger.log(
            `-> 🚩 User [${userPodcast.name} - ${userPodcast.firstname}]found in database `,
          );
          this.logger.log(`-> 🚩 Podcast [${podcast.libelle}]found in database `);
      
          episode.userCreated = userPodcast;
          episode.podcast=podcast
      
          this.logger.log(
            `-> 🚩 Starting save in database : [${JSON.stringify(episode)}] `,
          );
      
          return await this.episodeRepository
            .save(episode)
            .then(async (newEpisode: Episode ) => {
              this.logger.log(`-> Successfuly save in database`);
      
              let obj: any = {
                libelle: `Audio de l'episode intitule : ${newEpisode.libelle}`,
                categorie: 'Audio episode',
                fk_of_all_table: newEpisode.uuid,
                doc_author: `${firstname} - ${name}`,
              };
              await this.gedService.saveDocumentUrl(obj, file, userConnected);
              return newEpisode;
            });
        }


        async getEpisodeByUuid(
            episode: Partial<EpisodeDto>,
            userConnected?: Omit<Users, 'password_hash'>,
          ): Promise<Episode> {
            this.logger.log(`-> 🚩 Getting  Episode [${episode.libelle}] ⚠️...`);
        
            const existingEpisode: Episode = await this.episodeRepository.findOneBy({
              uuid: episode.uuid,
            });
        
            if (!existingEpisode)
              throw new ConflictException("L\'episode n'existe pas ");
        
            this.logger.log(
              `-> 🚩Episode succesfully found in database [${existingEpisode.libelle}] ⚠️...`,
            );
        
            // let documentUrl: Ged = await this.gedService.verifyDocInBaseAndMinioStorage(
            //   {
            //     uuid: existingEpisode.uuid,
            //   },
            // );
            let audioFile = await this.gedService.previewDocument({uuid:existingEpisode.uuid},userConnected)
            existingEpisode.audioFile = audioFile;
            return existingEpisode;
          }
}
