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
import * as XLSX from 'xlsx';
const { readFile } = require('node:fs/promises');
const { resolve } = require('node:path');
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

  //Pour favoriser le chargement seulement a la demande
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

  //By Laye_Tech ,Ici a chaque fois que je recupere les podcast d'une categorie donnee ,je n'ai pas besoin des logs(write in table) car c'est de l'affichage 😀😀
  //C'est ce qui explique le fait que je procede a une signature de l'image 😀😀,
  //ce qui ne devrait pas etre le cas pour les episodes car l'action y est ,je m'ennui franchement 🤔🤔

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

  async logFile() {
    try {
      //const filePath = resolve('./fariTestedAccessoire.xlsx');
      // const filePath = resolve('./TLV_ACCESSOIRES_QUALITY_CENTER_2025-05-07_0730.csv');
      // const contents = await readFile(filePath, { encoding: 'utf8' });
      // var json = this.filesToJson({
      //   filename: './TLV_ACCESSOIRES_QUALITY_CENTER_2025-05-07_0730.csv',
      //   raw: true,
      // });
      //  var boucle=json.map((el:any)=>{
      //   return el.MODEL_LABEL=this.normalizeString(el.MODEL_LABEL)
      //  })
      //  return boucle
      var json=this.normalizeString("Multi TV avec dÃ©codeur secondaire")
        console.log(json);
        console.log('Multi TV avec décodeur secondaire'==json)
      // this.filterSales('2025-05-08', json);
    } catch (err) {
      console.error(err.message);
    }
  }

  public async filterSales(date: string, sales: any[]) {
    console.log('Les ventes enoyes ', sales);
    const filteredSales = [];
    // const allSales = await this.repo.find();
    const allSales = this.filesToJson({
      filename: './tableAccesoire.xlsx',
      raw: true,
    });
    console.log("allsales@second",allSales)

    for (const currentSale of sales) {
      const currentAccessory = this.normalizeString(currentSale.accessoire);
      let sale: any = allSales.find(
        (storedSale: any) =>
          storedSale.numeroCommande == currentSale.numeroCommande &&
          storedSale.jour == currentSale.jour &&
          this.normalizeString(storedSale.accessoire) == currentAccessory,
      );
      if (sale) {
        if (sale.etatCommande == currentSale.etatCommande) {
          continue;
        }
        currentSale['uuid'] = sale.uuid;
        console.log('cuurentSale', currentSale);
      }
      filteredSales.push(currentSale);
    }

    return { filteredSales, total: filteredSales.length };
  }
  normalizeString(text: string): string {
    return Buffer.from(text, 'latin1').toString('utf8').normalize('NFC').trim();
  }

  filesToJson({
    filename,
    tabname = undefined,
    raw = false,
    codepage = parseInt('ISO-8859-1'),
  }: {
    filename: string;
    tabname?: string;
    raw?: boolean;
    codepage?: number;
  }): any[] {
    const workbook = XLSX.readFile(filename, {
      raw,
      codepage, // This shit makes the whole file to UTF-8. ! It Was a 4 hours long fcking BUG !
    });

    const tab = tabname ? tabname : workbook.SheetNames[0];
    console.log(
      `([UTILSHELPER * FilesToJson]) --> Opening File : [${filename}] - [${tab}]...`,
    );
    return XLSX.utils.sheet_to_json(workbook.Sheets[tab]);
  }
}
