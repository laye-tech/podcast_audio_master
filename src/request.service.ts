import { Injectable, Scope } from "@nestjs/common";


@Injectable({ scope: Scope.REQUEST })
export class RequestService {
    private userdId: string;

    setUserId(userdId: string) {
        this.userdId = userdId;
    }

    getUserId() {
        return this.userdId
    }

 

}