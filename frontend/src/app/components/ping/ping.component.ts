import { Component, OnInit } from '@angular/core';
import { ApiService } from "app/services/api.service";

@Component({
  selector: 'app-ping',
  templateUrl: './ping.component.html',
  styleUrls: ['./ping.component.css']
})
export class PingComponent implements OnInit {

  results : Array<number> = [];

  constructor(private api : ApiService) { }

  ngOnInit() {
  }

  ping() {
    this.api.ping().then((value : number) => {
      this.results.push(value);
    });
  }

}
