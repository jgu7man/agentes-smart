import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { ParametersService } from 'src/app/services/parameters.service';

@Component({
  selector: 'as-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss']
})
export class ParametersComponent implements OnInit {

  switchAddParameter: boolean = false

  constructor (
    public currentIntent: CurrentIntentService,
    public params: ParametersService
  ) { }

  async ngOnInit() {}


  async loadParams() {

  }

  toAddParam() {
    this.switchAddParameter = true
  }

}
