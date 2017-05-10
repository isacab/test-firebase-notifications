import { TestBed, inject, async } from '@angular/core/testing';

import { IndexedDBService } from './indexed-db.service';

fdescribe('IndexedDBService', () => {
  beforeEach(async() => {
    TestBed.configureTestingModule({
      providers: [IndexedDBService]
    });
  });

  it('1. should put objects into database and then get one of them.', (done) => {
    let service = TestBed.get(IndexedDBService);
    service.open().then(() => {
      
      let objStoreName = service.OBJECT_STORES[0].name;
      let data = [
        {key: 'obj1', data: 'test'},
        {key: 'obj2', data: 'test'},
        {key: 'obj3', data: 'test'},
      ];
      let countCompleted = 0;

      // put values
      data.forEach(element => {
        service.put(objStoreName, element).then(() => {
          countCompleted++;
          // check if all values has been inserted
          if(countCompleted === data.length) {
            // get all values
            console.log("All values has been inserted");

            // get value
            service.get(objStoreName, data[0].key).then((result) => {
              expect(result).toEqual(data[0]);

              console.log("1. done");
              done();
            },
            (error) => {
              fail("Could not get data. ");
            });
          }
        },
        (error) => {
          console.log("error", error);
          fail("Could not put data.");
        });
      });
    },
    (error) => {
      fail("Could not open database. ");
    });
  });

  it('2. delete all', (done) => {
    let service = TestBed.get(IndexedDBService);
    service.open().then(() => {
      
      let objStoreName = service.OBJECT_STORES[0].name;

      service.deleteAll(objStoreName).then(() => {
        // get values
        service.getMany(objStoreName).then((result) => {
          console.log("result: ", result);

          expect(result.length).toBe(0);

          console.log("2. done");
          done();
        },
        (error) => {
          fail("4. Could not get data. ");
        });
      },
      (error) => {
        console.error(error);
        fail("2. Error when clearing the database.");
      });
    },
    (error) => {
      fail("2. Could not open database. ");
    });
  });

  it('3. should not put objects into database with wrong key', (done) => {
    let service = TestBed.get(IndexedDBService);
    service.open().then(() => {
      
      let objStoreName = service.OBJECT_STORES[0].name;
      let key = service.OBJECT_STORES[0].optionalParameters.keyPath;
      let data = {wrongKey: 'obj1', data: 'test'};

      // put values
      service.put(objStoreName, data)
        .then((data) => {
          fail("3. Should not be able to put this data.")
        },
        (error) => {
          console.log("3. done");
          done();
        });
    },
    (error) => {
      fail("3. Could not open database. ");
    });
  });

  it('4. should put objects into database and then get all of them', (done) => {
    let service = TestBed.get(IndexedDBService);
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
        service.put(objStoreName, element).then(() => {
          countCompleted++;
          // check if all values has been inserted
          if(countCompleted === data.length) {
            // get all values
            console.log("All values has been inserted");

            // get values
            service.getMany(objStoreName).then((result) => {
              console.log("result: ", result);

              expect(result.length).toBe(3);
              expect(result[0]).toEqual(data[0]);
              expect(result[1]).toEqual(data[1]);
              expect(result[2]).toEqual(data[3]);

              console.log("4. done");
              done();
            },
            (error) => {
              fail("4. Could not get data. ");
            });
          }
        },
        (error) => {
          console.log("error", error);
          fail("4. Could not put data.");
        });
      });
    },
    (error) => {
      fail("4. Could not open database. ");
    });
  });

  it('5. should delete an object', (done) => {
    let service = TestBed.get(IndexedDBService);
    service.open().then(() => {
      
      let objStoreName = service.OBJECT_STORES[0].name;
      let data = {key: 'obj1', data: 'test'};

      // put values
      service.put(objStoreName, data)
        .then(() => {
          service.delete(objStoreName, data.key)
            .then(() => {
              service.get(objStoreName, data.key)
                .then((result) => {
                  expect(result).toBeUndefined();
                  console.log("5. done (result was null)")
                  done();
                });
            },
            (error) => {
              fail("5. Error when deleting object.");
            });
        },
        (error) => {
          console.log("error", error);
          fail("5. Could not put data.");
        });
      },
      (error) => {
        fail("5. Could not open database. ");
      });
    });

  it('6. should not get an object with wrong key.', (done) => {
    let service = TestBed.get(IndexedDBService);
    let objStoreName = service.OBJECT_STORES[0].name;

    service.open().then(() => {

      // get value
      service.get(objStoreName, 'wrongKey').then((result) => {
        expect(result).toBeUndefined();

        console.log("6. done");
        done();
      },
      (error) => {
        fail("Error while getting data. ");
      });

    },
    (error) => {
      fail("Could not open database. ");
    });
  });
});