import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Podcast } from './entities/podcast.entities';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PodcastDto } from './DtoPodcast/podcast.dto';
import { UsersService } from 'src/users/users.service';
import { GedService } from 'src/ged/ged.service';
import { CategoryService } from 'src/category/category.service';
import { Users } from 'src/users/entities/users.entity';
import { ConfigService } from '@nestjs/config';
import { Ged } from 'src/ged/Entities/ged.entities';

@Injectable()
export class PodcastService extends TypeOrmCrudService<Podcast> {
  private logger: Logger;
  constructor(
    @InjectRepository(Podcast)
    private readonly podcastRepository: Repository<Podcast>,
    private readonly usersService: UsersService,
    private readonly gedService: GedService,
    private readonly categoryService: CategoryService,
    private readonly configService: ConfigService,
  ) {
    super(podcastRepository);
    this.logger = new Logger(PodcastService.name);
  }

  /**
   * 
   * @param podcast 
   * @param file 
   * @param userConnected 
   * @returns 
   */
  async createPodcast(
    podcast: PodcastDto,
    file: Express.Multer.File,
    userConnected: Omit<Users, 'password_hash'>,
  ): Promise<Podcast> {
    this.logger.log(`-> 🚩 Creating New Podcast [${podcast.libelle}] ⚠️...`);

    const { login, firstname, name, email, profileImgPath } = userConnected;

    let [userPodcast, category] = await Promise.all([
      this.usersService.findOneBy({
        login: login,
      }),
      this.categoryService.findOneBy({ uuid: podcast.category_uuid }),
    ]);

    if (!userPodcast || !category)
      throw new ConflictException(
        "L'utilisateur ou la categorie  n'existe pas ",
      );
    this.logger.log(
      `-> 🚩 User [${userPodcast.name} - ${userPodcast.firstname}]found in database `,
    );
    this.logger.log(`-> 🚩 Category [${category.libelle}]found in database `);

    podcast.category = category;
    podcast.user = userPodcast;

    this.logger.log(
      `-> 🚩 Starting save in database : [${JSON.stringify(podcast)}] `,
    );

    return await this.podcastRepository
      .save(podcast)
      .then(async (newPodcast: Podcast) => {
        this.logger.log(`-> Successfuly save in database`);

        let obj: any = {
          libelle: `Profil de couverture du podcast intitule : ${newPodcast.libelle}`,
          categorie: 'Image Podcast',
          fk_of_all_table: newPodcast.uuid,
          doc_author: `${firstname} - ${name}`,
        };
        await this.gedService.saveDocumentUrl(obj, file, userConnected);
        return newPodcast;
      });
  }

  /**
   * Pour favoriser le chargement seulement a la demande
   * @param podcast 
   * @param userConnected 
   * @returns 
   */
  async getPodcastByUuid(
    podcast: Partial<PodcastDto>,
    userConnected?: Omit<Users, 'password_hash'>,
  ): Promise<Podcast> {
    this.logger.log(`-> 🚩 Getting  Podcast [${podcast.libelle}] ⚠️...`);

    const existingPodcast: Podcast = await this.podcastRepository.findOneBy({
      uuid: podcast.uuid,
    });

    if (!existingPodcast)
      throw new ConflictException("Le podcast  n'existe pas ");

    this.logger.log(
      `-> 🚩Podcast succesfully found in database [${existingPodcast.libelle}] ⚠️...`,
    );

    let documentUrl: Ged = await this.gedService.verifyDocInBaseAndMinioStorage(
      {
        uuid: existingPodcast.uuid,
      },
    );
    let image = await this.gedService.previewDocumentWithUrlSigned(
      documentUrl.url,
    );
    existingPodcast.coverImgPath = image;
    return existingPodcast;
  }

  /**
   * By Laye_Tech ,Ici a chaque fois que je recupere les podcast d'une categorie donnee ,je n'ai pas besoin des logs(write in table) car c'est de l'affichage 😀😀
   * C'est ce qui explique le fait que je procede a une signature de l'image 😀😀,
   * ce qui ne devrait pas etre le cas pour les episodes car l'action y est ,je m'ennui franchement 🤔🤔
   * sache que je t'aime Sala ❤️❤️❤️❤️❤️❤️
   * @param podcast 
   * @returns 
   */
  async getPodcastByCategorie(
    podcast: Partial<PodcastDto>,
  ): Promise<Podcast[]> {
    let allPodcastInSameCategory: Podcast[] = [];
    this.logger.log(
      `-> 🚩 Getting  Podcast by category_uuid [${podcast.uuid}] ⚠️...`,
    );

    const existingPodcast: Podcast[] = await this.podcastRepository.find({
      where: {
        category: {
          uuid: podcast.category_uuid,
        },
      },
      relations: ['category'],
    });

    if (!existingPodcast)
      throw new ConflictException("Le podcast  n'existe pas ");
    for (const pod of existingPodcast) {
      let documentUrl: Ged =
        await this.gedService.verifyDocInBaseAndMinioStorage({
          uuid: pod.uuid,
        });
      let image = await this.gedService.previewDocumentWithUrlSigned(
        documentUrl.url,
      );
      pod.coverImgPath = image;
      allPodcastInSameCategory.push(pod);
    }

    this.logger.log(
      `-> 🚩Podcast succesfully found in database [${allPodcastInSameCategory.length}] ⚠️...`,
    );

    return allPodcastInSameCategory;
  }

}
