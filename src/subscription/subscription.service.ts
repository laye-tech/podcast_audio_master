import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { SubscriptionUser } from './entities/subscription.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { GedService } from 'src/ged/ged.service';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { EpisodeService } from 'src/episode/episode.service';
import { SubscriptionDto } from './dtoSubscription/subscription.dto';
import { Users } from 'src/users/entities/users.entity';
import { PodcastService } from 'src/podcast/podcast.service';

@Injectable()
export class SubscriptionService extends TypeOrmCrudService<SubscriptionUser> {
  private logger: Logger;
  constructor(
    @InjectRepository(SubscriptionUser)
    private readonly subscripptionRepository: Repository<SubscriptionUser>,
    private readonly usersService: UsersService,
    private readonly gedService: GedService,
    private readonly configService: ConfigService,
    private readonly podcastService: PodcastService,
  ) {
    super(subscripptionRepository);
    this.logger = new Logger(SubscriptionService.name);
  }
  /**
   * Pemet de creer les abonnements  a un podcast  donne ,il y'a une petite nuance entre cette entite est l'entite Favoris qui stocke l'episode en question ,alors qu'ici on 
   * cherche a souscrire dans une podcast entiere qui lui regroupe un tas d'episode ,il est plus general
   * Je m'ennui quand meme ,sache que je t'aime Sala ❤️❤️❤️❤️❤️❤️ ###laye_tech
   * @param playlistUser
   * @param userConnected
   * @returns
   */
  async createSubscriptionUser(
    subscriptionUser: SubscriptionDto,
    userConnected: Omit<Users, 'password_hash'>,
  ): Promise<SubscriptionUser> {
    const { login, firstname, name, email, profileImgPath } = userConnected;

    this.logger.log(
      `-> 🚩 Creating New Subscription for User [${firstname} - ${name}] ⚠️...`,
    );

    let [userPlayList, podcast] = await Promise.all([
      this.usersService.findOneBy({
        login: login,
      }),
      this.podcastService.findOneBy({
        uuid: subscriptionUser.podcast_uuid,
      })
    ]);

    if (!userPlayList || !podcast )
      throw new ConflictException(
        "L'utilisateur ou le podcast n'existe pas ",
      );
    this.logger.log(
      `-> 🚩 User [${userPlayList.name} - ${userPlayList.firstname}]found in database `,
    );

    this.logger.log(
      `-> 🚩 Podcast [${podcast.libelle} - ${podcast.description}]found in database `,
    );

   

    subscriptionUser.podcast = podcast;
    subscriptionUser.user_id = userPlayList.id;

    this.logger.log(
      `-> 🚩 Starting save in database : [${JSON.stringify(subscriptionUser)}] `,
    );

    return await this.subscripptionRepository
      .save(subscriptionUser)
      .then(async (newSubscriptionUser: SubscriptionUser) => {
        this.logger.log(`-> Successfuly save in database`);
        return newSubscriptionUser;
      });
  }
}
