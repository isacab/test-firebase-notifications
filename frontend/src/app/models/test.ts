export class Test {
    numNotificationsPerInterval : number;
    numIntervals : number;
    interval : number;
    
    constructor(init?:Partial<Test>) {
        Object.assign(this, init);
    }

    totalNumNotifications() : number {
        return this.numNotificationsPerInterval * this.numIntervals;
    }
}