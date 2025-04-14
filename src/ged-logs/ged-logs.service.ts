import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { GedLogs } from './entities/ged-logs.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GedLogDto } from './Dto/gedLogsDto';

@Injectable()
export class GedLogsService extends TypeOrmCrudService<GedLogs> {
    private logger: Logger

    constructor(
        @InjectRepository(GedLogs)
        private readonly gedlogsRepository: Repository<GedLogs>,

    ) {
        super(gedlogsRepository)
        this.logger = new Logger(GedLogsService.name)
    }

    async createLog(dto: GedLogDto) {
        const { action, metadata, document_uuid, user } = dto;
    
        try {
          await this.gedlogsRepository.save({
            action: action,
            metadata: metadata,
            document_uuid: document_uuid,
            user: user,
          });
    
          this.logger.log(`Log créé pour l'action: ${action}, Document UUID: ${document_uuid}, Utilisateur: ${user}`);
        } catch (error) {
          this.logger.error(`Erreur lors de la création du log pour le document ${document_uuid}`, error.stack);
          throw new Error('Erreur lors de la création du log');
        }
      }
}
