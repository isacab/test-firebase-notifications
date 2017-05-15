import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Shared } from '../shared';
import { PushRegistration } from '../models/push-registration';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {

  private readonly apiUrl = Shared.BASE_API_URL;
  private readonly options : RequestOptions;

  constructor(private http : Http) 
  { 
    let headers = new Headers({'Content-Type': 'application/json'});
    this.options = new RequestOptions({ headers: headers });
  }

  getPushRegistration(token : string) : Promise<PushRegistration> {
    let url = this.apiUrl + "/pushregistrations/" + token;
    let request = this.http.get(url);
    return request
            .map(this.extractData)
            .catch(this.handleError)
            .toPromise();
  }

  createPushRegistration(registration : PushRegistration) : Promise<PushRegistration> {
    let url = this.apiUrl + "/pushregistrations"
    let request = this.http.post(url, registration, this.options);
    return request
              .map(this.extractData)
              .catch(this.handleError)
              .toPromise();
  }

  updatePushRegistration(token : string, registration : PushRegistration) : Promise<PushRegistration> {
    let url = this.apiUrl + "/" + token;
    let request = this.http.put(url, registration, this.options);
    return request
              .map(this.extractData)
              .catch(this.handleError)
              .toPromise();
  }

  removePushRegistration(token : string) : Promise<any> {
    let url = this.apiUrl + "/" + token;
    let request = this.http.delete(url);
    return request
              .map(this.extractData)
              .catch(this.handleError)
              .toPromise();
  }

  sendPushNotification(token : string) : Promise<any> {
    let url = this.apiUrl + "/pushregistrations"
    let request = this.http.post(url, { }, this.options);
    return request
              .map(this.extractData)
              .catch(this.handleError)
              .toPromise();
  }

  private extractData(res: Response) {
    let body = res.json()
    return body.data || { };
  }

  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    console.error(errMsg);
    return Promise.reject(errMsg);
  }

}
