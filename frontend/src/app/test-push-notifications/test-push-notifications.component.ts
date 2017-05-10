import { Component, OnInit } from '@angular/core';
import { IndexedDBService } from '../services/indexed-db.service';

@Component({
  selector: 'test-push-notifications',
  templateUrl: './test-push-notifications.component.html',
  styleUrls: ['./test-push-notifications.component.css']
})
export class TestPushNotificationsComponent implements OnInit {

  constructor(private db : IndexedDBService) { }

  ngOnInit() {
    console.log('db.isOpen(): {0}', this.db.isOpen());

    let objStoreName = 'push-notifications';
      let data = [
        {key: 'obj1', value: 'test'},
        {key: 'obj2', value: 'test'},
        {key: 'obj3', value: 'test'},
        {key: 'obj3', value: 'updated'},
      ];
      let countCompleted = 0;

      // put values
      data.forEach(element => {
        this.db.put(objStoreName, element).then(() => {
          countCompleted++;
          // check if all values has been inserted
          if(countCompleted === data.length) {
            // get all values
            console.log("All values has been inserted");

            // get values
            this.db.getMany(objStoreName).then((result) => {
              console.log("result: ", result);
              console.log("done");
            });
          }
        },
        (error) => {
          //console.log("error", error);
        });
      });
  }

}
