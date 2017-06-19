import { Component, OnInit, ViewChild, Output, Input, EventEmitter } from '@angular/core';
import { PushNotificationService } from '../../services/push-notification.service';
import { TestPushNotificationsService } from '../../services/test-push-notifications.service';
import { Test } from '../../models/test';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'new-test-form',
  templateUrl: './new-test-form.component.html',
  styleUrls: ['./new-test-form.component.css']
})
export class NewTestFormComponent implements OnInit {

  isSubmitting : boolean;
  model : Test = new Test({numNotificationsPerInterval: 1, numIntervals: 1, interval: 0});

  testPushForm : NgForm;
  @ViewChild('testPushForm') currentForm : NgForm;

  constructor(
    private pushService : PushNotificationService, 
    private testService : TestPushNotificationsService,
    private router : Router,
  ) { }

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
  }

  submit() {
    this.updateFormErrors();
    if(!this.currentForm.valid)
      return;
    let pushReg = this.pushService.pushRegistration;
    if(pushReg) {
      let token = pushReg.token;
      this.isSubmitting = true;
      this.testService.start(token, this.model)
        .then((test : Test) => {
          this.isSubmitting = false;
          this.formErrors.submit = '';
          this.router.navigate(['/test', test.id]);
        }).catch((err) => {
          this.formErrors.submit = err;
          this.isSubmitting = false;
        });
    }
  }

  onValueChanged(data?: any) {
    this.updateFormErrors();
  }

  updateFormErrors() {
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
      'required': 'Name is required.',
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
  };

}
