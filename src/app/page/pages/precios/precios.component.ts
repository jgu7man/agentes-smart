import { Component, OnInit } from '@angular/core';
import { MxAuth } from '@marxa/auth';

@Component({
  templateUrl: './precios.component.html',
  styleUrls: ['./precios.component.scss']
})
export class PreciosComponent implements OnInit {

    constructor (
      public _auth: MxAuth
  ) { }

  ngOnInit(): void {
  }

}
