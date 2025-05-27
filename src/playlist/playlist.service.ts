import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Playlist } from './entities/playlist.entities';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { GedService } from 'src/ged/ged.service';
import { ConfigService } from '@nestjs/config';
import { PlayListDto } from './DtoPlaylist/playlist.dto';
import { Users } from 'src/users/entities/users.entity';
import { Ged } from 'src/ged/Entities/ged.entities';
import { of } from 'rxjs';

@Injectable()
export class PlaylistService extends TypeOrmCrudService<Playlist> {
  private logger: Logger;
  constructor(
    @InjectRepository(Playlist)
    private readonly playListRepository: Repository<Playlist>,
    private readonly usersService: UsersService,
    private readonly gedService: GedService,
    private readonly configService: ConfigService,
  ) {
    super(playListRepository);
    this.logger = new Logger(PlaylistService.name);
  }
/**
 * 
 * @param playlist 
 * @param file 
 * @param userConnected 
 * @returns 
 */
  async createPlayList(
    playlist: PlayListDto,
    file: Express.Multer.File,
    userConnected: Omit<Users, 'password_hash'>,
  ): Promise<Playlist> {
    this.logger.log(`-> 🚩 Creating New PlayList [${playlist.libelle}] ⚠️...`);

    const { login, firstname, name, email, profileImgPath } = userConnected;

    let userPlayList = await this.usersService.findOneBy({
      login: login,
    });

    if (!userPlayList)
      throw new ConflictException("L'utilisateur n'existe pas ");
    this.logger.log(
      `-> 🚩 User [${userPlayList.name} - ${userPlayList.firstname}]found in database `,
    );

    playlist.user = userPlayList;
    playlist.user_id = userPlayList.id;

    this.logger.log(
      `-> 🚩 Starting save in database : [${JSON.stringify(playlist)}] `,
    );

    return await this.playListRepository
      .save(playlist)
      .then(async (newPlaylist: Playlist) => {
        this.logger.log(`-> Successfuly save in database`);

        let obj: any = {
          libelle: `Profil de couverture du playList intitule : ${newPlaylist.libelle}`,
          categorie: 'Image PlayList',
          fk_of_all_table: newPlaylist.uuid,
          doc_author: `${firstname} - ${name}`,
        };
        await this.gedService.saveDocumentUrl(obj, file, userConnected);
        return newPlaylist;
      });
  }

  /**
   * 
   * @param podcast 
   * @param userConnected 
   * Pour favoriser le chargement seulement a la demande
   * @returns 
   */
  
  async getPlayListByUuid(
    podcast: Partial<PlayListDto>,
    userConnected?: Omit<Users, 'password_hash'>,
  ): Promise<Playlist> {
    this.logger.log(`-> 🚩 Getting  PlayList [${podcast.libelle}] ⚠️...`);

    const existingPlaylist: Playlist = await this.playListRepository.findOneBy({
      uuid: podcast.uuid,
    });

    if (!existingPlaylist)
      throw new ConflictException("Le playList  n'existe pas ");

    this.logger.log(
      `-> 🚩PlayList succesfully found in database [${existingPlaylist.libelle}] ⚠️...`,
    );

    let documentUrl: Ged = await this.gedService.verifyDocInBaseAndMinioStorage(
      {
        uuid: existingPlaylist.uuid,
      },
    );
    let image = await this.gedService.previewDocumentWithUrlSigned(
      documentUrl.url,
    );
    existingPlaylist.coverImgPath = image;
    return existingPlaylist;
  }

  /**
   * Permet de recuperer tous les playlist creer par un utilisateur
   * l'idee est de faire une boucle for sur  la table des documents puis de proceder a la signature de l'url.
   * maintenant par quel moyen peut-on declencher la requete ,on consoit que nous avons un bouton playlist qui
   * grace aux evenement appel l'endpoint en lui passant l'user connected et a partir de la je lui renvoie tous
   * les playlist de cette user ,parfois je m'ennui quand meme ,sache que je t'aime Sala ❤️❤️❤️❤️❤️❤️
   */
  async getAllPlayListOwnByuser(
    userConnected?: Omit<Users, 'password_hash'>,
  ): Promise<Playlist[]> {
    const { id, login, firstname, name, email, profileImgPath } = userConnected;

    this.logger.log(
      `-> 🚩 Getting All PlayList owned by [${firstname} -${name} -${login}] ⚠️...`,
    );

    const foundUserconnected: Users = await this.usersService
      .exposeRepo()
      .findOneBy({ login: login });
    if (!foundUserconnected)
      throw new ConflictException("L'utilisateur n'existe pas");

    const existingPlaylist: Playlist[] = await this.playListRepository.find({
      where: { user_id: foundUserconnected.id },
    });

    if (!existingPlaylist)
      throw new ConflictException('Aucune playList trouve dans la base ');

    this.logger.log(
      `-> 🚩PlayList succesfully found in database [${existingPlaylist.length}] ⚠️...`,
    );

    let playlistTab: Playlist[] = [];
    for (const playlist of existingPlaylist) {
      let documentUrl: Ged =
        await this.gedService.verifyDocInBaseAndMinioStorage({
          uuid: playlist.uuid,
        });
      let image = await this.gedService.previewDocumentWithUrlSigned(
        documentUrl.url,
      );
      playlist.coverImgPath = image;
      playlistTab.push(playlist)
    }
    return playlistTab;
  }
}
