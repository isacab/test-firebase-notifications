import { Injectable } from '@angular/core';

import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

declare var window: any;

@Injectable()
export class IndexedDBService {

  readonly DB_NAME = 'test-firebase-notifications';
  readonly DB_VERSION = 1;
  readonly OBJECT_STORES = [
    { name: 'push_notifications_data', optionalParameters: { keyPath: 'key', autoIncrement: false } }
  ];

  private db : IDBDatabase = null;

  constructor() { }

  isSuported() : boolean {
    return !!window.indexedDB;
  }

  isOpen() : boolean {
    return this.db !== null;
  }

  open() : Promise<any> {
    
    return new Promise((resolve, reject) => {
      
      if(!this.isSuported()) {
        reject("IndexedDB is not suported by this browser.");
      }

      let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onupgradeneeded = (event) => {
          let db = request.result;
          this.OBJECT_STORES.forEach(element => {
            let obj = db.createObjectStore(element.name, element.optionalParameters);
          });                 
      };
      
      request.onsuccess = (e) => {
        console.log('Database loaded');
        this.db = request.result;
        resolve(request.readyState);
      };
      
      request.onerror = (e) => {
        alert('Error loading this.db');
        reject(request.error.name);
      };

    });

  }

  get(objStoreName : string, key: any) {
    let transaction = this.db.transaction([objStoreName], 'readonly');
    let objectStore = transaction.objectStore(objStoreName);

    return new Promise((resolve, reject) => {

      let request = objectStore.get(key);

      request.onerror = function(event : any) {
        reject((<IDBRequest>event.target).error.name);
      };

      request.onsuccess = function(event : any) {
        let result = event.result;
        resolve(result);
      };
    });
  }

  getAll(objStoreName : string) {
    let transaction = this.db.transaction([objStoreName], 'readonly');
    let objectStore = transaction.objectStore(objStoreName);

    return new Promise((resolve, reject) => {
      let request = objectStore.openCursor();
      
      request.onsuccess = (event : Event) => {
        let cursor = request.result;
        let result = [];
        if (cursor) {
          alert("Name for SSN " + cursor.key + " is " + cursor.value.name);
          result.push(cursor.value);
          cursor.continue();
        }
        else {
          resolve(result);
        }
      }

      request.onerror = (event: Event) => {
          reject(request.error.name);
      }

    });
  }

  put(objStoreName : string, data) {
    let transaction = this.db.transaction([objStoreName], 'readwrite');
    let objectStore = transaction.objectStore(objStoreName);

    return new Promise((resolve, reject) => {
      // Put this object into the database.
      // If an object with the same key already exist, the object gets updated
      // If it doesn't exist a new entry will be added in the database.
      var request = objectStore.put(data);

      request.onerror = function(event) {
        reject(request.error.name);
      };
      request.onsuccess = function(event) {
        resolve(request.readyState);
      };
    });
  }

  delete(objStoreName : string, key) {
    let transaction = this.db.transaction([objStoreName], 'readwrite');
    let objectStore = transaction.objectStore(objStoreName);

    return new Promise((resolve, reject) => {

      let request = objectStore.delete(key); // Deletes the record by the key.
  
      request.onsuccess = (event: Event) => {
          resolve(request.readyState);
      }
      
      request.onerror = (event: Event) => {
        reject(request.error.name);
      }

    });
  }

  deleteAll(objStoreName : string) {
    let transaction = this.db.transaction([objStoreName], 'readwrite');
    let objectStore = transaction.objectStore(objStoreName);

    return new Promise((resolve, reject) => {

      let request = objectStore.clear();

      request.onsuccess = (event: Event) => {
          resolve(request.readyState);
      }
      
      request.onerror = (event: Event) => {
        reject(request.error.name);
      }
    });
  }

}
