import { Component, OnInit } from '@angular/core';
import { AgenteConfigModel } from 'src/app/models/agent.model';

@Component({
  selector: 'as-call-contact',
  templateUrl: './call-contact.component.html',
  styleUrls: ['./call-contact.component.scss']
})
export class CallContactComponent implements OnInit {

  config: AgenteConfigModel
  constructor () {
    this.config = new AgenteConfigModel('')
   }

  ngOnInit(): void {
  }

}
