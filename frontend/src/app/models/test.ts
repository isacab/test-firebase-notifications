import { NotificationData } from "./notification-data";

export class Test {
    id : number;
    name : string;
    numNotificationsPerInterval : number;
    numIntervals : number;
    interval : number;
    notifications : Array<NotificationData>;
    running: boolean;
    createdAt: string;
    
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
