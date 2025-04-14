import {
 IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ActionType } from '../entities/ged-logs.entities';


export class GedLogDto {

  @IsNotEmpty()
  action: ActionType;

  @IsOptional()
  metadata: Record<string, any>;

  @IsNotEmpty()
  document_uuid: string;

  @IsNotEmpty()
  user: string;

}
