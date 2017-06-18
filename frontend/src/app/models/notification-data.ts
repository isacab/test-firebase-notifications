export class NotificationData {

    title : string;
    body : string;
    sequenceNumber : string;
    sent : string;
    latency : number;
    testId : number;
    obsolete : boolean;

    constructor(init?:Partial<NotificationData>) {
        Object.assign(this, init);
    }
}
