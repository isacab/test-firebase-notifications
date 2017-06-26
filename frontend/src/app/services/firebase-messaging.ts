import { Observable } from 'rxjs';

export interface FirebaseMessaging {
  ready() : Observable<any>;
  getToken() : Observable<any>;
  onMessage() : Observable<any>;
  onTokenRefresh() : Observable<any>;
  requestPermission() : Observable<any>;
  available() : Observable<any>;
}