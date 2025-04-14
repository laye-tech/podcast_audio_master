import { ApiProperty } from "@nestjs/swagger";
import { Column, DataSourceOptions, Entity, Index } from "typeorm";

export enum ActionType {
    CREATION = 'creation',
    MODIFICATION = 'modification',
    CONSULTATION = 'consultation',
    TELECHARGEMENT = 'telechargement',
    SUPPRESSION = 'suppression',
    CHANGEMENT_PERMISSIONS = 'changement_permissions',
    CHANGEMENT_STATUT = 'changement_statut'
}
@Index("ged_logs_podcast", ["uuid"], { unique: true })
@Entity("ged_logs", { schema: "public" })
export class GedLogs {
    @ApiProperty()
    @Column("uuid", {
        primary: true,
        name: "uuid",
        default: () => "uuid_generate_v4()",
    })
    uuid: string;

    @ApiProperty({ enum: ActionType, nullable: false })
    @Column({ type: 'enum', enum: ActionType, name: 'action' })
    action: ActionType;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @ApiProperty()
    @Column('character varying', { name: 'document_uuid', length: 500, nullable: false })
    document_uuid: string;

    @ApiProperty()
    @Column('character varying', { name: 'user', length: 500, nullable: false })
    user: string;

    @Column("timestamp with time zone", {
        name: "date",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    date: Date | null;
}