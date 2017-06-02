import { NotificationData } from "app/models/notification-data";

export class Test {
    id : number;
    name : string;
    numNotificationsPerInterval : number;
    numIntervals : number;
    interval : number;
    notifications : Array<NotificationData>;
    
    constructor(init?:Partial<Test>) {
        Object.assign(this, init);
    }

    numReceivedNotifications() : number {
        return this.notifications.length;
    }

    totalNumNotifications() : number {
        return this.numNotificationsPerInterval * this.numIntervals;
    }
}
