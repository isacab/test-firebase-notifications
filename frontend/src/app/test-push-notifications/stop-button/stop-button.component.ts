import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Test } from '../../models/test';

@Component({
  selector: 'stop-button',
  templateUrl: './stop-button.component.html',
  styleUrls: ['./stop-button.component.css']
})
export class StopButtonComponent implements OnInit {

  @Input() test : Test;
  @Output('stop') onStop : EventEmitter<any> = new EventEmitter();

  isStopping : boolean;

  errors = {
    'stop': ''
  }

  constructor(private api : ApiService) { }

  ngOnInit() {
  }
  
  canStop() : boolean {
    let model = this.test,
        isStopping = this.isStopping;
    return model && model.id && model.running && !isStopping;
  }

  stopTest() {
    this.isStopping = true;
    this.api.stopTest(this.test.id)
      .then(() => {
        this.isStopping = false;
        this.errors.stop = '';
        this.onStop.emit();
      }).catch((err) => {
        this.isStopping = false;
        this.errors.stop = err;
      });
  }

}
