import { ArgumentMetadata, Injectable, Logger, PipeTransform } from "@nestjs/common";

@Injectable()
export class FreezPipe implements PipeTransform {
    private readonly logger = new Logger(FreezPipe.name)
    transform(value: any, metadata: ArgumentMetadata) {
         this.logger.debug('FreezePipe running ...')
        Object.freeze(value)

        return value;
    }

}