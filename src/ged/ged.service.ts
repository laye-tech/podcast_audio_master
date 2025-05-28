import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Ged, PermissionType } from './Entities/ged.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Raw, Repository } from 'typeorm';
import { GedDto } from './Dto/gedDto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { template } from 'handlebars';
import { MinioClientService } from 'src/minio/minio.service';
import { GedLogsService } from 'src/ged-logs/ged-logs.service';
import { ActionType } from 'src/ged-logs/entities/ged-logs.entities';
interface State {
  uuid: string;
  state: string;
}
@Injectable()
export class GedService extends TypeOrmCrudService<Ged> {
  private logger: Logger;
  baseBucket: string;
  baseBucketDeleted: string;

  constructor(
    @InjectRepository(Ged)
    private readonly gedRepository: Repository<Ged>,
    private readonly minioService: MinioClientService,
    private readonly gedLogService: GedLogsService,
    private readonly configService: ConfigService,
  ) {
    super(gedRepository);
    this.baseBucket = this.configService.get('BUCKET_NAME');
    this.baseBucketDeleted = this.configService.get(
      'BUCKET_NAME_WITH_FILES_DELETED',
    );
    this.logger = new Logger(GedService.name);
  }

  async getAllDocs(params: Partial<GedDto>): Promise<Ged[]> {
    try {
      let alldoc = await this.getAllDoc(params);
      this.logger.log(`Tous les documents :[${alldoc.length}]`);
      return alldoc;
    } catch (error) {
      this.logger.error(`Erreur lors : ${error.message}`);
      throw error;
    }
  }

  async verifyDocInBaseAndMinioStorage(data: Partial<GedDto>): Promise<Ged> {
    this.logger.log(`start search doc in base and cloud : Oh je m'ennui `);
    const document = await this.checkExistingDocument(data);

    await this.minioService.checkFileExists(this.baseBucket, document.url);
    return document;
  }

  async previewDocument(data: Partial<GedDto>, user: any) {
    try {
      const document = await this.checkExistingDocument(data);
      const exists = await this.minioService.checkFileExists(
        this.baseBucket,
        document.url,
      );

      if (!exists) {
        throw new NotFoundException(`Document non trouvé: ${document.url}`);
      }
      const metadata = await this.minioService.getDocumentMetadata(
        this.baseBucket,
        document.url,
      );

      const documentStream = await this.minioService.getDocumentStream(
        this.baseBucket,
        document.url,
      );

      // 🔁 Lire le stream et créer un buffer
      //   const chunks = [];
      //   for await (const chunk of documentStream) {
      //     chunks.push(chunk);
      //   }
      //   const buffer = Buffer.concat(chunks);

      let obj = {
        action: ActionType.CONSULTATION,
        user: `${user.login}-${user.firstname}-${user.name}`,
        document_uuid: document.uuid,
        metadata: {
          consultation: 'Le document a été consulte avec succès.',
        },
      };
      this.logger.log(`📝 Détails du log:${JSON.stringify(obj)}`);
      await this.gedLogService.createLog(obj);
      return {
        documentStream: documentStream,
        metadata: metadata,
      };
      //   return {
      //     metadata,
      //     base64: `data:${metadata.contentType};base64,${buffer.toString('base64')}`,
      //   };
    } catch (error) {
      console.error('Erreur complète:', error);
      throw new NotFoundException(`Document non trouvé: ${document}`);
    }
  }

  async previewDocumentWithUrlSigned(objectName: string) {
    try {
      let url = await this.minioService.getPresignedUrl(
        this.baseBucket,
        objectName,
      );
      return url;
    } catch (error) {
      console.error('Erreur complète:', error);
      throw new NotFoundException(`Document non trouvé: ${document}`);
    }
  }

  async downloadDocument(uuid: string, user: any) {
    try {
      let urlDocument = await this.checkExistingDocument({ uuid: uuid });

      let [metadata, documentStream] = await Promise.all([
        this.minioService.getDocumentMetadata(this.baseBucket, urlDocument.url),
        this.minioService.getDocumentStream(this.baseBucket, urlDocument.url),
      ]);
      // const metadata = await this.minioService.getDocumentMetadata(
      //   this.baseBucket,
      //   urlDocument.url,
      // );

      // const documentStream = await this.minioService.getDocumentStream(
      //   this.baseBucket,
      //   urlDocument.url,
      // );

      let obj = {
        action: ActionType.TELECHARGEMENT,
        user: `${user.login}-${user.firstname}-${user.name}`,
        document_uuid: uuid,
        metadata: {
          telechargement: 'Le document a été telecharge avec succès.',
        },
      };
      this.logger.log(`📝 Détails du log:${JSON.stringify(obj)}`);
      await this.gedLogService.createLog(obj);

      return {
        stream: documentStream,
        metadata: metadata,
      };
    } catch (error) {
      throw new NotFoundException(`Document non trouvé: ${error}`);
    }
  }

  async saveDocumentUrl(
    data: GedDto,
    file: Express.Multer.File,
    user: any,
  ): Promise<Ged> {
    this.logger.log(
      `🗑️ [DOCUMENT SAVE] Début de l'enregistrement du document.`,
    );
    const startTime = Date.now();

    try {
      await this.checkDuplicatesDocument(data);

      let savedObjectInBucket = await this.minioService.upload(
        file,
        this.baseBucket,
        data,
      );

      this.logger.log(
        'Object saved in bucket ',
        JSON.stringify(savedObjectInBucket),
      );

      (data.url = savedObjectInBucket.fileName),
        (data.type_document = savedObjectInBucket.typeDocument);
      let saveToDatabase = await this.saveToDatabase(data);
      let obj = {
        action: ActionType.CREATION,
        user: `${user.login}-${user.firstname}-${user.name}`,
        document_uuid: saveToDatabase.uuid,
        metadata: {
          creation: 'Le document a été créer avec succès.',
        },
      };
      this.logger.log(`📝 Détails du log:${JSON.stringify(obj)}`);
      await this.gedLogService.createLog(obj);

      this.logSuccess(startTime);
      return saveToDatabase;
    } catch (error) {
      this.logger.error(`Erreur lors : ${error.message}`);
      throw error;
    }
  }

  async updateDocumentWithFile(
    data: GedDto,
    file: Express.Multer.File,
    user: any,
  ): Promise<Ged> {
    this.logger.log(
      `🗑️ [DOCUMENT UPDATE] Début de la modification du document.`,
    );

    const startTime = Date.now();
    let tag: Record<string, any>;
    let metadata = {};
    try {
      let doc = await this.checkExistingDocument(data);

      let sourceObjectNameAndBucket = `${this.baseBucket}/${doc.url}`;
      await this.minioService.copyObject(
        this.baseBucketDeleted,
        this.baseBucket,
        `${doc.libelle}_archived_${Date.now()}`,
        sourceObjectNameAndBucket,
        doc.url,
      );

      await this.minioService.deleteObject(doc.url, this.baseBucket);

      this.logger.log(`✅ Document supprimé du cloud avec succès`);

      let savedObjectInBucket = await this.minioService.upload(
        file,
        this.baseBucket,
        data,
      );

      data.url = savedObjectInBucket.fileName;
      data.uuid = data.uuid;

      let saveToDatabase = await this.updateDocumentBase(data, doc, metadata);

      metadata['Modification du Fichier'] = {
        AncienDocument: `L'ancien fichier remplacer est :[${doc.libelle}] se touvant dans l'emplacement[${doc.url}]`,
        Info: 'le fichier est supprimé aussi du cloud, mais stocke dans le Bucket des fichiers supprimées ',
        Modification: `Le fichier a été remplacer avec succès par l'utilisateur ${user.login}-${user.firstname}-${user.name} `,
      };

      let obj = {
        action: ActionType.MODIFICATION,
        user: `${user.login}-${user.firstname}-${user.name}`,
        document_uuid: (await saveToDatabase.gedEnti).uuid,
        metadata: await saveToDatabase.metadata,
      };

      this.logger.log(`📝 Détails du log:${JSON.stringify(obj)}`);
      await this.gedLogService.createLog(obj);
      this.logSuccess(startTime);
      return saveToDatabase.gedEnti;
    } catch (error) {
      this.logger.error(`Erreur lors : ${error.message}`);
      throw error;
    }
  }

  async changeStateDocument(uuid: string, state: string, user: any) {
    this.logger.log(
      `🗑️ [DOCUMENT UPDATE] Début de la modification du statut du document.`,
    );

    const startTime = Date.now();
    let metadata = {};
    try {
      let doc = await this.checkExistingDocument({ uuid, state });

      metadata['Modification de Statut '] = this.getFieldChanges(
        doc.state,
        state,
      );

      let update = Object.assign(doc, { state: state });

      let saveToDatabase = await this.gedRepository.save(update);
      this.logger.log(`✅ Changement de Statut effectuè avec succès`);

      let obj = {
        action: ActionType.CHANGEMENT_STATUT,
        user: `${user.login}-${user.firstname}-${user.name}`,
        document_uuid: uuid,
        metadata: metadata,
      };

      this.logger.log(`📝 Détails du log:${JSON.stringify(obj)}`);
      await this.gedLogService.createLog(obj);
      this.logSuccess(startTime);
      return saveToDatabase;
    } catch (error) {
      this.logger.error(`Erreur lors : ${error.message}`);
      throw error;
    }
  }

  async updateDocumentWithoutFile(data: GedDto, user: any): Promise<Ged> {
    this.logger.log(
      `🗑️ [DOCUMENT UPDATE] Début de la modification du document avec fichier joint.`,
    );

    const startTime = Date.now();
    let metadata = {};
    try {
      let doc = await this.checkExistingDocument(data);
      data.uuid = data.uuid;
      data.url = doc.url;
      let saveToDatabase = await this.updateDocumentBase(data, doc, metadata);

      let obj = {
        action: ActionType.MODIFICATION,
        user: `${user.login}-${user.firstname}-${user.name}`,
        document_uuid: (await saveToDatabase.gedEnti).uuid,
        metadata: await saveToDatabase.metadata,
      };

      this.logger.log(`📝 Détails du log:${JSON.stringify(obj)}`);
      await this.gedLogService.createLog(obj);
      this.logSuccess(startTime);
      return saveToDatabase.gedEnti;
    } catch (error) {
      this.logger.error(`Erreur lors : ${error.message}`);
      throw error;
    }
  }

  async createBucket(bucketName: string) {
    return await this.minioService.createBucketIfNotExists(bucketName);
  }

  async deleteDocument(uuid: string, user: any): Promise<void> {
    let metadata = {};

    const startTime = Date.now();
    this.logger.log(
      `🗑️ Démarrage de la suppression du document dans la base de données et le cloud pour l'UUID [${uuid}]`,
    );

    try {
      let findDoc = await this.gedRepository.findOneBy({ uuid: uuid });

      if (!findDoc) {
        this.logger.warn(
          `⚠️ Document avec l'UUID [${uuid}] non trouvé dans la base de données`,
        );
        throw new Error("Le document n'existe pas");
      }

      await this.gedRepository.delete(findDoc.uuid).then(async (el) => {
        this.logger.log(
          `✅ Document [${findDoc.libelle}] supprimé de la base de données`,
        );

        await this.minioService.deleteObject(findDoc.url, this.baseBucket);

        this.logger.log(
          `✅ Document [${findDoc.libelle}] supprimé du cloud (URL: ${findDoc.url})`,
        );

        metadata['Suppression du Fichier'] = {
          AncienDocument: `L'ancien fichier supprimer est :[${findDoc.libelle}] se touvant dans l'emplacement[${findDoc.url}]`,
          Info: 'le fichier est supprime aussi du cloud ',
          Modification: `Le fichier a été supprimer avec succès par l'utilisateur ${user.login}-${user.firstname}-${user.name} `,
        };

        let obj = {
          action: ActionType.SUPPRESSION,
          user: `${user.login}-${user.firstname}-${user.name}`,
          document_uuid: uuid,
          metadata,
        };

        this.logger.log(`📝 Détails du log:${JSON.stringify(obj)}`);
        await this.gedLogService.createLog(obj);
        this.logSuccess(startTime);
      });
    } catch (error) {
      this.logger.error(`Erreur lors : ${error.message}`);

      throw error;
    }
  }

  private async checkExistingDocument(
    data: Partial<GedDto | State>,
  ): Promise<Ged> {
    this.logger.log(
      `🔍 Vérification de l'existence du document avec l'UUID [${data.uuid}] dans la base de données`,
    );

    const existingDoc = await this.gedRepository.findOneBy({
      fk_of_all_table: data.uuid,
    });

    if (!existingDoc) {
      this.logger.warn(
        `⚠️ Aucune correspondance trouvée pour le document avec l'UUID [${data.uuid}]`,
      );

      throw new ConflictException(`Le document n'existe pas `);
    }

    this.logger.log(
      `✅ Document trouvé: [${existingDoc.libelle}] avec l'UUID [${existingDoc.uuid}] dans la base de données`,
    );

    return existingDoc;
  }

  private async checkDuplicatesDocument(data: GedDto): Promise<void> {
    this.logger.log(
      `🔍 Vérification des doublons pour le document [${data.libelle}] dans la catégorie [${data.categorie}]`,
    );
    const existingDoc = await this.gedRepository.findOneBy({
      categorie: data.categorie,
      type_document: data.type_document,
      libelle: data.libelle,
      doc_author: data.doc_author,
    });

    if (existingDoc) {
      this.logger.warn(
        `⚠️ Document déjà existant : [${data.libelle}] dans la catégorie [${data.categorie}]`,
      );

      throw new ConflictException(
        `Le document existe déjà pour la categorie: ${data.categorie}`,
      );
    }
    this.logger.log(
      `✅ Aucun doublon trouvé pour le document [${data.libelle}] dans la catégorie [${data.categorie}]`,
    );
  }

  private async saveToDatabase(data: GedDto): Promise<Ged> {
    this.logger.log(
      `Starting database save for document: ${JSON.stringify(data)} 📄`,
    );

    try {
      const savedDoc = (await this.gedRepository.save(data)) as Ged;
      this.logger.log(
        `Document saved successfully with ID: ${savedDoc.uuid} ✅`,
      );
      return savedDoc;
    } catch (error) {
      this.logger.error(
        `Database save failed ❌: ${error.message}`,
        error.stack,
      );

      throw new Error(`Erreur lors de la sauvegarde en base: ${error}`);
    }
  }

  private logSuccess(startTime: number): void {
    const duration = Date.now() - startTime;
    this.logger.log(`Opération terminée avec succès en ${duration}ms`);
  }

  async updateDocumentBase(
    data: GedDto,
    doc: Ged,
    metadata: Record<string, any>,
  ) {
    let tag: Record<string, any>;

    const fieldsToCheck = [
      'libelle',
      'type_document',
      'categorie',
      'doc_author',
    ];
    fieldsToCheck.forEach((field) => {
      const change = this.getFieldChanges(doc[field], data[field]);
      if (change) {
        metadata[`Modification de ${field}`] = change;
      }
    });

    return {
      gedEnti: this.saveToDatabase(data),
      metadata: metadata,
    };
  }

  private getFieldChanges(oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      return { ancien: oldValue, nouveau: newValue };
    }
    return null;
  }

  async getAllDoc(params: Partial<GedDto>): Promise<Ged[]> {
    this.logger.log(`-> Fetching All Docs 📂 😀: ${JSON.stringify(params)} `);

    // try {
    //     // Déterminer si l'utilisateur est admin
    //     const requester = params.requester;
    //     const isAdmin = ["🛡️ SERVICE INFORMATIQUE", "SI", "🛡️ RSI"].some((value) =>
    //         requester === value
    //     );

    //     const parameters: any[] = [];
    //     let paramIndex = 1;

    //     // Convertir requester en tableau pour la requête
    //     const userLogArray = Array.isArray(requester) ? requester : [requester];

    //     // Préparer les paramètres pour la requête doc_tag
    //     let docTagsArray: string[] = [];
    //     if (params.doc_tag && typeof params.doc_tag === 'string') {
    //         docTagsArray = params.doc_tag.split(',').map(tag => tag.trim());
    //     }

    //     // Construction différente de la requête selon le rôle
    //     if (isAdmin) {
    //         // REQUÊTE POUR ADMIN
    //         let sql = `
    //           SELECT
    //             uuid, type_document, libelle, categorie, permissions, url, doc_author,
    //             (SELECT array_agg(DISTINCT key) FROM jsonb_object_keys(doc_tag) AS key) AS doc_tag,
    //             state,
    //             TRUE AS lecture,
    //             TRUE AS edition,
    //             TRUE AS telechargement,
    //             TRUE AS suppression
    //           FROM
    //             public.ged_db
    //           WHERE 1=1
    //         `;

    //         // Ajouter le filtre sur les dates si les dates sont fournies
    //         if (params.startDate && params.endDate) {
    //             const formattedStartDate = `${params.startDate} 00:00:00`;
    //             const formattedEndDate = `${params.endDate} 23:59:59`;
    //             sql += `AND "createdAt" BETWEEN $${paramIndex} AND $${paramIndex + 1}  `;
    //             parameters.push(formattedStartDate, formattedEndDate);
    //             paramIndex += 2; // On ajoute 2 à l'index des paramètres (une pour startDate et une pour endDate)
    //         }

    //         // Ajouter le filtre de type_document
    //         if (params.type_document) {
    //             sql += ` AND type_document = $${paramIndex}`;
    //             parameters.push(params.type_document);
    //             paramIndex++;
    //         }

    //         // Filtre sur le libellé
    //         if (params.libelle) {
    //             sql += ` AND libelle ILIKE $${paramIndex}`;
    //             parameters.push(`%${params.libelle}%`);
    //             paramIndex++;
    //         }

    //         // Filtre sur doc_tag
    //         if (docTagsArray.length > 0) {
    //             sql += ` AND doc_tag ?| $${paramIndex}`;
    //             parameters.push(docTagsArray);
    //             paramIndex++;
    //         }

    //         // Logique spéciale pour la catégorie - chercher dans les permissions
    //         if (params.categorie) {
    //             // Si des permissions spécifiques sont demandées
    //             if (params.permissions && Array.isArray(params.permissions) && params.permissions.length > 0) {
    //                 const validPermissions = params.permissions.filter(p =>
    //                     ['lecture', 'edition', 'telechargement', 'suppression'].includes(p)
    //                 );

    //                 if (validPermissions.length > 0) {
    //                     const permissionConditions = validPermissions.map(permission =>
    //                         `permissions->'${permission}' @> $${paramIndex}::jsonb`
    //                     );
    //                     sql += ` AND (${permissionConditions.join(' OR ')})`;
    //                     parameters.push(JSON.stringify([params.categorie]));
    //                     paramIndex++;
    //                 }
    //             } else {
    //                 // Si aucune permission spécifiée, chercher la catégorie dans n'importe quelle permission
    //                 sql += ` AND (
    //               permissions->'lecture' @> $${paramIndex}::jsonb OR
    //               permissions->'edition' @> $${paramIndex}::jsonb OR
    //               permissions->'telechargement' @> $${paramIndex}::jsonb OR
    //               permissions->'suppression' @> $${paramIndex}::jsonb
    //             )`;
    //                 parameters.push(JSON.stringify([params.categorie]));
    //                 paramIndex++;
    //             }
    //         }
    //         // Si aucune catégorie spécifiée et que des permissions sont demandées
    //         else if (params.permissions && Array.isArray(params.permissions) && params.permissions.length > 0) {
    //             const validPermissions = params.permissions.filter(p =>
    //                 ['lecture', 'edition', 'telechargement', 'suppression'].includes(p)
    //             );

    //             if (validPermissions.length > 0) {
    //                 const permissionConditions = validPermissions.map(permission =>
    //                     `jsonb_array_length(permissions->'${permission}') > 0`
    //                 );
    //                 sql += ` AND (${permissionConditions.join(' AND ')})`;
    //             }
    //         }

    //         return this.gedRepository.query(sql, parameters);
    //     }
    //     else {
    //         // REQUÊTE POUR NON-ADMIN
    //         let sql = `
    //           SELECT
    //             uuid, type_document, libelle, categorie, permissions, url, doc_author,
    //             (SELECT array_agg(DISTINCT key) FROM jsonb_object_keys(doc_tag) AS key) AS doc_tag,
    //             state,
    //             permissions->'lecture' ?| $1 AS lecture,
    //             permissions->'edition' ?| $1 AS edition,
    //             permissions->'telechargement' ?| $1 AS telechargement,
    //             permissions->'suppression' ?| $1 AS suppression
    //           FROM
    //             public.ged_db
    //           WHERE
    //         `;

    //         // Préparer les paramètres
    //         const parameters: any[] = [userLogArray];
    //         let paramIndex = 2;

    //         // Ajouter les filtres de base
    //         const filters = [];

    //         // Récupérer uniquement les documents actifs
    //         filters.push(`state = 'ACTIVE'`);

    //         if (params.type_document) {
    //             filters.push(`type_document = $${paramIndex}`);
    //             parameters.push(params.type_document);
    //             paramIndex++;
    //         }

    //         // Pour la cohérence, gardons le filtre original sur la colonne catégorie pour les non-admins
    //         if (params.categorie) {
    //             filters.push(`categorie = $${paramIndex}`);
    //             parameters.push(params.categorie);
    //             paramIndex++;
    //         }

    //         if (params.libelle) {
    //             filters.push(`libelle ILIKE $${paramIndex}`);
    //             parameters.push(`%${params.libelle}%`);
    //             paramIndex++;
    //         }

    //         if (docTagsArray.length > 0) {
    //             filters.push(`doc_tag ?| $${paramIndex}`);
    //             parameters.push(docTagsArray);
    //             paramIndex++;
    //         }

    //         // Logique de permissions pour non-admin
    //         if (params.permissions && Array.isArray(params.permissions) && params.permissions.length > 0) {
    //             const validPermissions = params.permissions.filter(p =>
    //                 ['lecture', 'edition', 'telechargement', 'suppression'].includes(p)
    //             );

    //             if (validPermissions.length > 0) {
    //                 const permissionConditions = validPermissions.map(permission =>
    //                     `permissions->'${permission}' ?| $1`
    //                 );
    //                 filters.push(`(${permissionConditions.join(' AND ')})`);
    //             }
    //         } else {
    //             // Si aucune permission spécifiée, vérifier au moins une permission
    //             filters.push(`(
    //             permissions->'lecture' ?| $1 OR
    //             permissions->'edition' ?| $1 OR
    //             permissions->'telechargement' ?| $1 OR
    //             permissions->'suppression' ?| $1
    //           )`);
    //         }

    //         // Combiner tous les filtres avec AND
    //         sql += filters.join(' AND ');

    //         return this.gedRepository.query(sql, parameters);
    //     }

    // } catch (error) {
    //     console.error("Erreur dans getAllDoc:", error);
    //     throw error;
    // }
    return;
  }
}
