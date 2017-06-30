export class NotificationData {

    id : number;
    sequenceNumber : number;
    sent : number;
    received : number;
    clientToServerRTT : number;
    testId : number;
    obsolete : boolean;

    constructor(init?:Partial<NotificationData>) {
        Object.assign(this, init);
    }
}
