export class NotificationData {

    id : number;
    sequenceNumber : number;
    sent : number;
    receivedServer : number;
    receivedClient : number;
    testId : number;
    failed : boolean;
    tap : boolean;

    constructor(init?:Partial<NotificationData>) {
        Object.assign(this, init);
    }
}
