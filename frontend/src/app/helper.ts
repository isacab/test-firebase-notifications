import {Injectable} from "@angular/core";

@Injectable()
export class Helper {
    
    constructor() { }

    errorMessage(error : any) : string {
        if(!error) {
            return "Unknown failure";
        }

        if(error instanceof String) {
            return error.toString();
        }

        if(navigator && navigator.onLine === false) {
            return "You are offline";
        }

        return error.message || "Server is offline.";
    }
}