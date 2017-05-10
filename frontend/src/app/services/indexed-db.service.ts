import { Injectable } from '@angular/core';

import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

import { IPair } from '../interfaces';

declare var window: any;

// Object containing properties needed to open a database
const IndexedDBConfig = Object.freeze({
    DB_NAME: 'test-firebase-notifications',
    DB_VERSION: 1,
    ON_UPGRADE_NEEDED: function(event : IDBVersionChangeEvent) {
      // Get the database
      let db = (<IDBOpenDBRequest>event.target).result;

      // Setup database object stores here
      db.createObjectStore('push_notifications', { keyPath: 'key', autoIncrement: false });
    },
});

@Injectable()
export class IndexedDBService {

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

      let request = indexedDB.open(IndexedDBConfig.DB_NAME, IndexedDBConfig.DB_VERSION);
      
      request.onupgradeneeded = IndexedDBConfig.ON_UPGRADE_NEEDED;
      
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

  get(objStoreName : string, key : any, defaultValue? : any) : Promise<IPair> {
    let transaction = this.db.transaction([objStoreName], 'readonly');
    let objectStore = transaction.objectStore(objStoreName);

    return new Promise((resolve, reject) => {

      let request = objectStore.get(key);

      request.onerror = function(event : any) {
        reject(request.error.name);
      };

      request.onsuccess = function(event : any) {
        let result = request.result;

        if(result === undefined) {
          result = defaultValue;
        }

        resolve(result);
      };
    });
  }

  getMany(objStoreName : string, keyRange? : string | number | IDBKeyRange | Date | IDBArrayKey) : Promise<Array<any>> {
    let transaction = this.db.transaction([objStoreName], 'readonly');
    let objectStore = transaction.objectStore(objStoreName);
    let result = [];

    return new Promise((resolve, reject) => {
      let request = objectStore.openCursor(keyRange);
      
      request.onsuccess = (event : Event) => {
        let cursor = request.result;
        if (cursor) {
          let value = cursor.value;
          result.push(value);
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

  put(objStoreName : string, data : IPair) : Promise<string> {
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

  delete(objStoreName : string, key) : Promise<string> {
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

  deleteAll(objStoreName : string) : Promise<string> {
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
