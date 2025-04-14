import { ApiProperty } from "@nestjs/swagger";
import { Column, DataSourceOptions, Entity, Index } from "typeorm";


@Index("tag_podcast", ["uuid"], { unique: true })
@Entity("tag", { schema: "public" })
export class Tag {
    @ApiProperty()
    @Column("uuid", {
        primary: true,
        name: "uuid",
        default: () => "uuid_generate_v4()",
    })
    uuid: string;

    @ApiProperty()
    @Column('character varying', { name: 'libelle', length: 1000 })
    libelle: string;

    @ApiProperty()
    @Column('character varying', { name: 'description', length: 800 })
    description: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ApiProperty()
    @Column('character varying', { name: 'state', length: 100, default: () => "'ACTIVE'" })
    state: string;

}

