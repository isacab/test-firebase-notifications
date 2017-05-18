export class PushNotAvailableError extends Error {

    public static get ServiceWorkerNotAvailable():string { return "ServiceWorkerNotAvailable"; }
    public static get PushNotAvailable():string { return "PushNotAvailable"; }
    public static get Blocked():string { return "Blocked"; }

    constructor(public code : string = "", public message: string = "") {
        super(message);
        this.name = "PushNotAvailableError";
        //this.stack = (<any> new Error()).stack;
    }

}

export class ResourceNotFoundError extends Error {

    constructor(public message: string = "") {
        super(message);
        this.name = "ResourceNotFoundError";
        this.stack = (<any> new Error()).stack;
    }

}