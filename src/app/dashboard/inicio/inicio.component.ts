import { Component, OnInit } from '@angular/core';
import { MxSEO } from '@marxa/devkit';

@Component({
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

  constructor (
    private _seo: MxSEO
  ) { }

  ngOnInit(): void {
  }

}
