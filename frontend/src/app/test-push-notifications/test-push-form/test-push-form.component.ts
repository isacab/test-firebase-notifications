import { Component, OnInit, ViewChild } from '@angular/core';
import { TestPushNotificationsService } from '../../services/test-push-notifications.service';
import { PushNotificationService } from '../../services/push-notification.service';
import { Test } from '../../models/test';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'test-push-form',
  templateUrl: './test-push-form.component.html',
  styleUrls: ['./test-push-form.component.css']
})
export class TestPushFormComponent implements OnInit {

  isSubmitting : boolean;
  isClearing : boolean;
  submitted : boolean;
  model : Test;

  constructor(private testService : TestPushNotificationsService, private pushService : PushNotificationService) { }
  
  testPushForm : NgForm;
  @ViewChild('testPushForm') currentForm : NgForm;

  ngAfterViewChecked() {
    this.formChanged();
  }

  formChanged() {
    if (this.currentForm === this.testPushForm) { 
      return; 
    }

    this.testPushForm = this.currentForm;

    if (this.testPushForm) {
      this.testPushForm.valueChanges
        .subscribe(data => this.onValueChanged(data));
    }
  }

  ngOnInit() {
    this.model = new Test({numNotificationsPerInterval: 1, numIntervals: 1, interval: 0});
  }

  submit() {
    let pushReg = this.pushService.pushRegistration;
    if(pushReg) {
      let token = pushReg.token;
      this.isSubmitting = true;
      this.testService.startTest(token, this.model)
        .then(() => {
          this.isSubmitting = false;
          this.formErrors.submit = '';
          this.formErrors.clear = '';
        }).catch((err) => {
          this.formErrors.submit = err;
          this.formErrors.clear = '';
          this.isSubmitting = false;
        });
    }
  }

  clear() {
    let pushReg = this.pushService.pushRegistration;
    if(pushReg) {
      let token = pushReg.token;
      this.isClearing = true;
      this.testService.clearTest(token)
        .then(() => {
          this.isClearing = false;
          this.formErrors.submit = '';
          this.formErrors.clear = '';
        }).catch((err) => {
          this.formErrors.clear = err;
          this.formErrors.submit = '';
          this.isClearing = false;
        });
    }
  }

  onValueChanged(data?: any) {
    if (!this.testPushForm) { 
      return; 
    }

    const form = this.currentForm.form;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  validationMessages = {
    'name': {
    },
    'numNotificationsPerInterval': {
      'required': 'Num notifications per interval is required.',
      'min':      'Num notifications per interval must be at least 1.',
      'max':      'Num notifications per interval cannot be more than 100.',
    },
    'numIntervals': {
      'required': 'Num intervals is required.',
      'min':      'Num intervals must be at least 1.',
      'max':      'Num intervals cannot be more than 100.',
    },
    'interval': {
      'required': 'Interval is required.',
      'min':      'Interval must be at least 0.',
      'max':      'Interval cannot be more than 100.',
    }
  };

  formErrors = {
    'name': '',
    'numNotificationsPerInterval': '',
    'numIntervals': '',
    'interval': '',
    'submit': '',
    'clear': ''
  };

}
