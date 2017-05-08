import { Injectable } from '@angular/core';

declare var window: any;

@Injectable()
export class IndexedDBService {

  readonly DB_NAME = 'test-firebase-notifications';
  readonly DB_VERSION = 1;
  readonly DB_STORE_NAME = 'push_notifications_data';

  private db = null;

  constructor() { 
    if(this.isSuported()) {
      this.openDB();
    }
  }

  isSuported() : boolean {
    return !!window.indexedDB;
  }

  private openDB() : void {
    this.db = indexedDB.open(this.DB_NAME, this.DB_VERSION);
                
    this.db.onupgradeneeded = function (e) {
        var db = e.target.result;                    
        var object = db.createObjectStore(this.DB_STORE_NAME, { keyPath : 'key', autoIncrement : false });
    };
    
    this.db.onsuccess = function (e) {
        console.log('Database loaded');
        //loadAll();
    };
    
    this.db.onerror = function (e) {
        alert('Error loading this.db');
    };

  }

  private add(key, value) {
    /*console.log("add ({0}, {1}):", key, value);

    var store = this.db.getObjectStore(this.DB_STORE_NAME, 'readwrite');
    var req;
    try {
      req = store.add(key, value);
    } catch (e) {
      if (e.name == 'DataCloneError')
        displayActionFailure("This engine doesn't know how to clone a Blob, " +
                             "use Firefox");
      throw e;
    }
    req.onsuccess = function (evt) {
      console.log("Insertion in DB successful");
      displayActionSuccess();
      displayPubList(store);
    };
    req.onerror = function() {
      console.error("addPublication error", this.error);
      displayActionFailure(this.error);
    };*/
  }

}
