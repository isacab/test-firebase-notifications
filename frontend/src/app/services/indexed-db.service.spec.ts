import { TestBed, inject } from '@angular/core/testing';

import { IndexedDBService } from './indexed-db.service';

fdescribe('IndexedDBService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IndexedDBService]
    });
  });

  it('should ...', inject([IndexedDBService], (service: IndexedDBService) => {
    expect(service).toBeTruthy();
  }));

  it('should put objects into database and then get all of them', inject([IndexedDBService], (service: IndexedDBService) => {
    service.open().then(() => {
      
      let objStoreName = service.OBJECT_STORES[0].name;
      let data = [
        {key: 'obj1', data: 'test'},
        {key: 'obj2', data: 'test'},
        {key: 'obj3', data: 'test'},
        {key: 'obj3', data: 'updated'},
      ];
      let countCompleted = 0;

      // put values
      data.forEach(element => {
        service.put(objStoreName, element.data).then(() => {
          countCompleted++;
          // check if all values has been inserted
          if(countCompleted === data.length) {
            // get all values
            console.log("All values has been inserted");
          }
        },
        (error) => {
          //console.log("error", error);
        });
      });

      expect(service).toBeTruthy();
    });
  }));

  it('should put objects into database and then get all of them', inject([IndexedDBService], (service: IndexedDBService) => {
    let objStoreName = service.OBJECT_STORES[0].name;
    service.open().then(() => {
      service.getAll(objStoreName).then((result) => {
        console.log(result);
      });
    });
  }));
});

describe('indexeddb tests', () => {
  it('true is true', () => expect(true).toBe(true));
});