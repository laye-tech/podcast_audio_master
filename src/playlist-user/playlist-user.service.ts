import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PlaylistUser } from './entities/playlistUser.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { GedService } from 'src/ged/ged.service';
import { ConfigService } from '@nestjs/config';
import { PlayListUserDto } from './DtoPlaylistUser/playlistUser.dto';
import { Users } from 'src/users/entities/users.entity';
import { EpisodeService } from 'src/episode/episode.service';
import { PlaylistService } from 'src/playlist/playlist.service';

@Injectable()
export class PlaylistUserService extends TypeOrmCrudService<PlaylistUser> {
  private logger: Logger;
  constructor(
    @InjectRepository(PlaylistUser)
    private readonly playListRepository: Repository<PlaylistUser>,
    private readonly usersService: UsersService,
    private readonly gedService: GedService,
    private readonly configService: ConfigService,
    private readonly episodeService: EpisodeService,
    private readonly playListService: PlaylistService,
  ) {
    super(playListRepository);
    this.logger = new Logger(PlaylistUserService.name);
  }

  /**
   * Pemet de creer les episodes d'un playlist donne ,il faut faire attention entre la creation de playlist qui lui est une entite a part entiere 
   * Car il ne sert a rien de creer un playlist sans y mettre des episodes ,ca na pas de sens ,c'est ridicule 😅😅😅😅😅😅 laye_tech
   * Je m'ennui quand meme ,sache que je t'aime Sala ❤️❤️❤️❤️❤️❤️ ###laye_tech
   * @param playlistUser
   * @param userConnected
   * @returns
   */
  async createPlayListUser(
    playlistUser: PlayListUserDto,
    userConnected: Omit<Users, 'password_hash'>,
  ): Promise<PlaylistUser> {
    const { login, firstname, name, email, profileImgPath } = userConnected;

    this.logger.log(
      `-> 🚩 Creating New PlayList for User [${firstname} - ${name}] ⚠️...`,
    );

    let [userPlayList, episode, playlist] = await Promise.all([
      this.usersService.findOneBy({
        login: login,
      }),
      this.episodeService.findOneBy({
        uuid: playlistUser.episode_uuid,
      }),
      this.playListService.findOneBy({
        uuid: playlistUser.playlist_uuid,
      }),
    ]);

    if (!userPlayList || !episode || !playlist)
      throw new ConflictException(
        "L'utilisateur ou l'episode ou le playlist n'existe pas ",
      );
    this.logger.log(
      `-> 🚩 User [${userPlayList.name} - ${userPlayList.firstname}]found in database `,
    );

    this.logger.log(
      `-> 🚩 Episode [${episode.libelle} - ${episode.description}]found in database `,
    );

    this.logger.log(
      `-> 🚩 Playlist [${playlist.libelle} - ${playlist.description}]found in database `,
    );

    playlistUser.episode = episode;
    playlistUser.user_id = userPlayList.id;
    playlistUser.playlist = playlist;

    this.logger.log(
      `-> 🚩 Starting save in database : [${JSON.stringify(playlistUser)}] `,
    );

    return await this.playListRepository
      .save(playlistUser)
      .then(async (newPlaylistUser: PlaylistUser) => {
        this.logger.log(`-> Successfuly save in database`);
        return newPlaylistUser;
      });
  }

  /**
   * Permet de recuperer tous les episodes d'un playlist donne
   * Il faut aussi faire la difference entre la table playlist qui lui est charge garde tous les playlist
   * cree par un utilisateur, tandisque la table playlistUser nous renseigne sur les differentes episodes que
   * l'utilisateur a mis dans son playlist .
   * Pour etre simple il faut comprendre un playlist comme un sac creee par un user et les objets qu'ils s'y mettent
   * represente ici les episodes ,d'ou la pertinence de la requete et aussi l'objet renvoyee contient deja une entite Episode
   * donc je procede uniquement a l'affichage de l'objet episode tous court ..
   * Je m'ennui quand meme ,sache que je t'aime Sala ❤️❤️❤️❤️❤️❤️ ###laye_tech
   * @param data
   * @returns
   */
  async getAllEpisodeOfPlaylist(
    data: Partial<PlayListUserDto>,
  ): Promise<PlaylistUser[]> {
    this.logger.log(
      `🎬 [getAllEpisodeOwnByPodcast] ➜ Recherche des épisodes pour le playlist UUID: ${data.playlist_uuid}`,
    );

    const existingEpisode: PlaylistUser[] = await this.playListRepository.find({
      where: { playlist_uuid: data.playlist_uuid },
    });

    if (!existingEpisode)
      this.logger.warn(
        `❌ Aucun épisode trouvé pour le playlist UUID: ${data.playlist_uuid}`,
      );
    this.logger.log(
      `✅ ${existingEpisode.length} épisode(s) trouvé(s) pour le playlist UUID: ${data.playlist_uuid}`,
    );

    return existingEpisode;
  }

  public exposeRepo() {
    return this.repo;
  }
}
