export class NotificationData {

    title : string;
    body : string;
    sent : string;

    constructor(init?:Partial<NotificationData>) {
        Object.assign(this, init);
    }
}
