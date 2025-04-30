import { ApiProperty } from "@nestjs/swagger";
import { Column, DataSourceOptions, Entity, Index } from "typeorm";

export enum TypeDocument {
    Pdf = "pdf",
    Docs = "docs",
    Xlsx = "xlsx",
    Png = 'png',
    Jpeg = "jpeg",
    Word = 'word',
    Audio = 'mp3/mp4',

}

export type PermissionType = {
    lecture: string[];
    edition: string[];
    suppression: string[];
    telechargement: string[];
};

@Index("ged_db_podcast", ["uuid"], { unique: true })
@Entity("ged_db", { schema: "public" })
export class Ged {
    @ApiProperty()
    @Column("uuid", {
        primary: true,
        name: "uuid",
        default: () => "uuid_generate_v4()",
    })
    uuid: string;

    @ApiProperty({ enum: TypeDocument })
    @Column({ type: 'enum', enum: TypeDocument, name: 'type_document' })
    type_document: TypeDocument | string;


    @ApiProperty()
    @Column('character varying', { name: 'libelle', length: 1000 })
    libelle: string;

    @ApiProperty()
    @Column('character varying', { name: 'categorie', length: 800 })
    categorie: string;

    @ApiProperty()
    @Column('character varying', {
        name: 'url',
        length: 1000,
        default: () => "''",
    })
    url: string

    // @ApiProperty()
    // @Column('jsonb', { name: 'permissions', nullable: false })
    // permissions: PermissionType | string | string[];

    @ApiProperty()
    @Column('character varying', { name: 'doc_author', length: 1000 })
    doc_author: string;


    // @ApiProperty()
    // @Column('jsonb', { name: 'doc_tag' })
    // doc_tag: Record<string, string> | string;

    //l'idee de ne pas garder une url de l'image dans chque table ,je veux les mettre tous dans la table ged ,
    // maintenant qu'on'a plusieurs tables avec chacune ses propres metadonnees ,je denormalise en disant que fk_of_all_table va etre la cle primaire de la table proprietaire de 
    //l'image du coup il devient une cle etrangere dans cette table.
    //De mon cote apres chaque save des infos de la table j'injecte le service j'attend la resolution de la promesse pour avoir l'id puis je save le doc 
    @ApiProperty()
    @Column('uuid', {
        name: 'fk_of_all_table',
        nullable: false,
    })
    fk_of_all_table: string | null;


    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ApiProperty()
    @Column('character varying', { name: 'state', length: 100, default: () => "'ACTIVE'" })
    state: string;


}


