import { Crud, CrudController } from '@dataui/crud';
import { Body, Controller, Post, Query, Res, UploadedFile, UseInterceptors, Get, Param, Delete, Patch, Put, Headers, Req } from '@nestjs/common';
import { Ged } from './Entities/ged.entities';
import { ApiTags } from '@nestjs/swagger';
import { GedService } from './ged.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { GedDto } from './Dto/gedDto';
import { ErrorThrower } from 'src/errors/errorthrower.helper';


@ApiTags('Ged')
@Crud({
    model: {
        type: Ged,
    },
    params: {
        uuid: {
            type: 'string',
            primary: true,
            field: 'uuid',
        },
    },
})
@Controller('ged')
export class GedController implements CrudController<Ged> {



    constructor(public service: GedService) {
    }
    @Post('/saveDoc')
    @UseInterceptors(FileInterceptor('file'))
    async saveDoc(@UploadedFile() file: Express.Multer.File, @Body() data: GedDto, @Req() req) {

        return await this.service.saveDocumentUrl(data, file, req.user)
    }

    @Put('/updateDoc')
    @UseInterceptors(FileInterceptor('file'))
    async updateDocWithFile(@UploadedFile() file: Express.Multer.File, @Body() data: GedDto, @Req() req) {


        return await this.service.updateDocumentWithFile(data, file, req.user)
    }


    @Put('/updateDocWithoutFile')
    async updateDocWithoutFile(@Body() data: GedDto, @Req() req) {


        return await this.service.updateDocumentWithoutFile(data, req.user)
    }


    @Get('/docs')
    async getDocs(@Query() query: Partial<GedDto>) {
        return await this.service.getAllDocs({
            // requester: query.requester,
            // categorie: query.categorie,
            // type_document: query.type_document,
            // startDate: query.startDate,
            // endDate: query.endDate,
            // libelle: query.libelle,
            // doc_tag: query.doc_tag ? query.doc_tag : '',
            // permissions: typeof query.permissions === 'string' ? query.permissions.split(',').map(tag => tag.trim()) : []
        })
    }


    @Post('/createBucket')
    async makeBucket(@Body() bucket: string) {
        return await this.service.createBucket(bucket)
    }


    //not used blocked by cors 
    @Delete('/delete')
    async deleteDocument(@Query() query, @Req() req) {
        if (!(query.uuid)) {
            ErrorThrower.throwBadRequest();
        }
        return await this.service.deleteDocument(query.uuid, req.user)
    }


    @Get('preview')
    async previewDocument(
        @Query() query,
        @Res() res: Response,
        @Req() req
    ) {
        // const { documentStream, metadata } = await this.service.previewDocument(query.uuid, req.user);
        // res.setHeader('Content-Type', metadata.contentType);
        // res.setHeader('Cache-Control', 'max-age=3600');
        // documentStream.pipe(res);
    }

    @Get('download')
    async downloadDocument(
        @Query() query,
        @Res() res: Response,
        @Req() req
    ) {
        const { stream, metadata } = await this.service.downloadDocument(query.url, query.uuid, req.user);

        res.setHeader('Content-Disposition', `attachment; filename="${metadata.filename}"`);
        res.setHeader('Content-Length', metadata.size);
        res.setHeader('Content-Type', metadata.contentType);
        stream.pipe(res);
    }

    @Patch('change')
    async changeStateDocument(@Query() query, @Req() req) {
        if (!(query.uuid || query.state)) {
            ErrorThrower.throwBadRequest();
        }
        return await this.service.changeStateDocument(query.uuid, query.state, req.user)
    }

   
}
