import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Stream } from 'stream';
import { BufferedFile } from '../minio/models/file.model'
import * as crypto from 'crypto'
import { MinioClient, MinioService, MinioCopyConditions } from 'nestjs-minio-client';
import { ConfigService } from '@nestjs/config';
import { BucketStream, BucketItem, CopyConditions } from 'minio'
import { GedDto } from '../ged/Dto/gedDto';
// import path from 'path';
import * as path from 'path';

import { TypeDocument } from '../ged/Entities/ged.entities';

interface DocInfo {
  fileName: string,
  typeDocument: TypeDocument | string

}

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;

  public get client(): MinioClient {
    return this.minio.client;
  }

  constructor(
    private readonly minio: MinioService,
    public configService: ConfigService
  ) {
    this.logger = new Logger('MinioStorageService');
  }

  public async upload(file: Express.Multer.File, baseBucket: string, data: GedDto): Promise<DocInfo> {
    this.logger.log(`🚀 Début de l'upload du fichier : ${file.originalname} 📝`);
    if (!(['jpeg', 'png', 'gif', 'pdf', 'docx', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/gif'].includes(file.mimetype.trim()))) {
      this.logger.error(`❌ Type de fichier non autorisé : ${file.mimetype}`);
      throw new HttpException(`Ce type de fichier n'est pas autorise: ${file.mimetype}`, HttpStatus.BAD_REQUEST)
    }

    this.logger.log(`✅ Type de fichier ${file.mimetype} est autorisé`);

    const metaData = {
      'Content-Type': file.mimetype,
      'X-Amz-Meta-Testing': file.size,
    };

    if (!file || !file.originalname) {
      throw new Error("Fichier invalide ou nom manquant");
    }
    const extname = path.extname(file.originalname);
    let filename = file.originalname
      .trim()
      .replace(/[^a-zA-Z0-9_.-]/g, '-')
      .toLowerCase();

    filename = `${filename.replace(extname, '')}${extname}`;

    const fileName: string = data.categorie ? `${data.categorie}/${filename}` : filename;
    const fileBuffer = file.buffer;

    this.logger.log(`🔄 Téléchargement du fichier vers le bucket [${baseBucket}] dans le dossier [${fileName}]`);


    await this.client.putObject(baseBucket, fileName, fileBuffer, file.size, metaData)
    this.logger.log(`✅ Fichier téléchargé avec succès dans le bucket [${baseBucket}] sous le nom [${fileName}]`);
    this.logger.log(`📜 Sauvegarde effectuée avec succès pour le fichier [${file.originalname}] dans le dossier [${fileName}]`);


    return { fileName: fileName, typeDocument: this.getTypeDocument(file.mimetype.trim()) }
  }

  async createBucketIfNotExists(bucketname: string) {
    const bucketExists = await this.client.bucketExists(bucketname)
    if (!bucketExists) {
      await this.client.makeBucket(bucketname, this.configService.get("REGION_NAME"))
    }


  }
  async deleteObject(objetName: string, baseBucket: string): Promise<void> {
    this.logger.log(`🗑️ Démarrage de la suppression de l'objet [${objetName}] dans le bucket [${baseBucket}]`);

    await this.client.removeObject(baseBucket, objetName, { forceDelete: true })
  }

  async copyObject(destinationBucket: string, baseBucketSource: string, fileNameInDestinationBucket: string, sourceObjectUrl: string, url: string) {
    this.logger.log(`🗑️ Démarrage de la copie de l'objet se trouvant dans le bucket source [${baseBucketSource}] vers le bucket [${destinationBucket}]`);

    try {
      await this.client.statObject(baseBucketSource, url);

      await this.client.copyObject(destinationBucket, fileNameInDestinationBucket, sourceObjectUrl, null);

      this.logger.log(`🗑️ Copie de l'objet se trouvant dans le bucket source [${baseBucketSource}] vers le bucket [${destinationBucket} effectue avec succes]`);

    } catch (error) {
      this.logger.error(`Le fichier ${url} n'existe pas dans le bucket ${baseBucketSource}.`);
      throw new Error(`Le fichier ${url} n'existe pas dans le bucket ${baseBucketSource}.`);
    }

  }

  async getAllObjectInBucket(baseBucket: string): Promise<BucketStream<BucketItem>> {
    try {
      const stream = await this.client.listObjects(baseBucket, "", true);
      return stream;
    } catch (error) {
      console.error("Erreur lors de la récupération des objets :", error);
      throw new Error("Impossible de récupérer les objets du bucket");
    }
  }

  async getDocumentStream(bucketName: string, url: string) {
    this.logger.log(`📥 Start fetching document :${url} 📝 from bucket :${bucketName} 📁`)
    return await this.client.getObject(bucketName, url);
  }

  async getDocumentMetadata(bucketName: string, url: string) {
    this.logger.log(`Fetching metadata for document: ${url} 📝 in bucket: ${bucketName} 📁`);

    const stat = await this.client.statObject(bucketName, url);
    this.logger.debug(`Full metadata response: ${JSON.stringify(stat)}`);
    return {
      filename: stat.metaData.filename || 'Unknown',
      contentType: stat.metaData['content-type'] || 'Unknown',
      size: stat.size
    };
  }

  async checkFileExists(bucketName: string, url: string): Promise<boolean> {
    this.logger.log(`🔍 Vérification de l'existence du fichier : ${url} dans le bucket ${bucketName}`);

    try {
      await this.client.statObject(bucketName, url);
      this.logger.log(`✅ Le fichier ${url} existe dans le bucket ${bucketName}`);

      return true;
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la vérification de l'existence du fichier ${url} dans le bucket ${bucketName} : ${error.message}`);
      return false;
    }
  }

  getTypeDocument(params: string): TypeDocument | string {
    let typeDoc: TypeDocument | string

    switch (params) {
      case 'pdf':
      case 'application/pdf':
        typeDoc = TypeDocument.Pdf;
        break;

      case 'word':
      case 'docx':
      case 'docs':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        typeDoc = TypeDocument.Docs;
        break;

      case 'xlsx':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        typeDoc = TypeDocument.Xlsx;
        break;

      case 'png':
      case 'image/png':
      case 'image/gif':
        typeDoc = TypeDocument.Png;
        break;

      case 'jpeg':
        typeDoc = TypeDocument.Jpeg;
        break;

      default:
        "Inconnue"
        break;
    }

    return typeDoc;
  }

}
