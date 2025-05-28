import { Crud, CrudController } from '@dataui/crud';
import {
  Body,
  Controller,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Delete,
  Patch,
  Put,
  Headers,
  Req,
} from '@nestjs/common';
import { Ged } from './Entities/ged.entities';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GedService } from './ged.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { GedDto } from './Dto/gedDto';
import { ErrorThrower } from 'src/errors/errorthrower.helper';
import { Public } from 'src/auth/decorators/public.routes.decorators';
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PreviewQueryDto {
  @ApiProperty({ description: 'UUID du document à prévisualiser' })
  @IsUUID()
  uuid: string;
}

export class DownloadQueryDto {
  @ApiProperty({ description: 'UUID du document à télécharger' })
  @IsUUID()
  uuid: string;
}
@ApiTags('Ged')
@ApiBearerAuth('access-token')
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
  constructor(public service: GedService) {}
  // @Post('/saveDoc')
  // @UseInterceptors(FileInterceptor('file'))
  // async saveDoc(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() data: GedDto,
  //   @Req() req,
  // ) {
  //   return await this.service.saveDocumentUrl(data, file, req.user);
  // }

  @Put('/updateDoc')
  @UseInterceptors(FileInterceptor('file'))
  async updateDocWithFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: GedDto,
    @Req() req,
  ) {
    return await this.service.updateDocumentWithFile(data, file, req.user);
  }

  // @Put('/updateDocWithoutFile')
  // async updateDocWithoutFile(@Body() data: GedDto, @Req() req) {
  //   return await this.service.updateDocumentWithoutFile(data, req.user);
  // }


  @Get('preview')
  async previewDocument(
    @Query() query: PreviewQueryDto,
    @Res() res: Response,
    @Req() req,
  ) {
    const { documentStream, metadata } = await this.service.previewDocument(
      { uuid: query.uuid },
      req.user,
    );

    res.setHeader('Content-Type', metadata.contentType);

    res.setHeader('Cache-Control', 'max-age=3600');
    documentStream.pipe(res);
  }

  @Get('download')
  async downloadDocument(@Query() query:DownloadQueryDto, @Res() res: Response, @Req() req) {
    const { stream, metadata } = await this.service.downloadDocument(
      query.uuid,
      req.user,
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${metadata.filename}"`,
    );
    res.setHeader('Content-Length', metadata.size);
    res.setHeader('Content-Type', metadata.contentType);
    stream.pipe(res);
  }

  @Patch('change')
  async changeStateDocument(@Query() query, @Req() req) {
    if (!(query.uuid || query.state)) {
      ErrorThrower.throwBadRequest();
    }
    return await this.service.changeStateDocument(
      query.uuid,
      query.state,
      req.user,
    );
  }
}
