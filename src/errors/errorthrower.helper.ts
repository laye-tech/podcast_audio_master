import { HttpException, HttpStatus, Logger } from "@nestjs/common";

export class ErrorThrower {
    private static logger = new Logger(ErrorThrower.name);
    public static throwBadRequest() {
        throw new HttpException({
            status: HttpStatus.BAD_REQUEST,
            message: 'Les paramêtres de la requêtes sont incorrect. Merci de renseigner tout les champs.',
        }, HttpStatus.BAD_REQUEST);
    }
    public static throwBadContentRequest() {
        throw new HttpException({
            status: HttpStatus.BAD_REQUEST,
            message: 'Le corps de la requête est incorrect. Merci de renseigner tout les champs.',
        }, HttpStatus.BAD_REQUEST);
    }

    public static throwReportingError(msg: string) {
        throw new Error(msg);
    }

    public static throwError(msg: string) {
        throw new Error(msg);
    }

    public static throwProcessDuplicityError(context: string) {
        this.logger.warn(`>> [${context}] ⛔ ABORTED TO AVOID PROCESS DUPLICATION BECAUSE OF LOAD BALANCING ⛔`);
        return false;
    }
}