import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { environment } from '../../environments/environment';
import { PushRegistration } from '../models/push-registration';
import { Test } from '../models/test';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {

  private readonly apiUrl = environment.baseApiUrl;
  private readonly options : RequestOptions;

  constructor(private http : Http) 
  { 
    let headers = new Headers({'Content-Type': 'application/json'});
    this.options = new RequestOptions({ headers: headers });
  }

  getPushRegistration(token : string) : Promise<PushRegistration> {
    let url = this.apiUrl + "/pushregistrations/" + token;
    return this.http.get(url)
      .toPromise()
      .then((res) => this.handleResponse(res, PushRegistration))
      .catch((err) => this.handleError(err));
  }

  getTest(id : number) : Promise<Test> {
    let url = this.apiUrl + "/testpushnotifications/" + id;
    return this.http.get(url)
      .toPromise()
      .then((res) => this.handleResponse(res, Test))
      .catch((err) => this.handleError(err));
  }

  getTestList(token : string) : Promise<Array<Test>> {
    let url = this.apiUrl + "/testpushnotifications?token=" + token;
    return this.http.get(url)
      .toPromise()
      .then((res) => this.handleArrayResponse(res, Test))
      .catch((err) => this.handleError(err));
  }

  createPushRegistration(registration : PushRegistration) : Promise<PushRegistration> {
    let url = this.apiUrl + "/pushregistrations"
    return this.http.post(url, registration, this.options)
      .toPromise()
      .then((res) => this.handleResponse(res, PushRegistration))
      .catch((err) => this.handleError(err));
  }

  updatePushRegistration(token : string, registration : PushRegistration) : Promise<PushRegistration> {
    let url = this.apiUrl + "/pushregistrations/" + token;
    return this.http.put(url, registration, this.options)
      .toPromise()
      .then((res) => this.handleResponse(res, PushRegistration))
      .catch((err) => this.handleError(err));
  }

  removePushRegistration(token : string) : Promise<any> {
    let url = this.apiUrl + "/pushregistrations/" + token;
    return this.http.delete(url)
      .toPromise()
      .catch(this.handleError);
  }

  startTest(token : string, test : Test) : Promise<Test> {
    let url = this.apiUrl + "/testpushnotifications/start/" + token;
    return this.http.post(url, test, this.options)
      .toPromise()
      .then((res) => this.handleResponse(res, Test))
      .catch((err) => this.handleError(err));
  }

  stopTest(testId : number) : Promise<Test> {
    let url = this.apiUrl + "/testpushnotifications/stop/" + testId;
    return this.http.post(url, { }, this.options)
      .toPromise()
      .then((res) => this.handleResponse(res, Test))
      .catch((err) => this.handleError(err));
  }

  private handleResponse<T>(response : Response, type: { new(init?:Partial<T>): T ;} ) : T {
    let json = response.json();
    return new type(json);
  }

  private handleArrayResponse<T>(response : Response, type : { new(init?:Partial<T>): T ;}) : Array<T> {
    let json : Array<any> = response.json();
    return json.map((x) => {
      return new type(x);
    });
  }

  private handleError (error: Response | any) {
    let errMsg = '';

    if(error instanceof Response) {
      let body = error.json() || { };
      errMsg = body.message || '';
    } else if(error.message) {
      errMsg = error.message;
    }

    console.error(errMsg);

    return Promise.reject(new Error(errMsg));
  }

}
