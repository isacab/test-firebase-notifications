export class NotificationData {

    sequenceNumber : number;
    sent : string;
    latency : number;
    testId : number;
    obsolete : boolean;

    constructor(init?:Partial<NotificationData>) {
        Object.assign(this, init);
    }
}
