export class PushNotAvailableError extends Error {

    constructor(public message: string = "") {
        super(message);
        this.name = "PushNotAvailableError";
    }

}

export class ResourceNotFoundError extends Error {

    constructor(public message: string = "") {
        super(message);
        this.name = "ResourceNotFoundError";
    }

}