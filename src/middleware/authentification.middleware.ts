import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { RequestService } from "src/request.service";

@Injectable()
export class AuthentificationMiddleware implements NestMiddleware {
    private readonly logger = new Logger(AuthentificationMiddleware.name)
  
    constructor(private readonly requestService: RequestService) { }
    use(req: Request, res: Response, next: NextFunction) {
        this.logger.log(AuthentificationMiddleware.name)
        //Authenticate the request
        const userId = '123'
        this.requestService.setUserId(userId);

        next()
    }

}