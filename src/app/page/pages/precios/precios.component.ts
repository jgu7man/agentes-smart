import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/admin/auth/auth.service';

@Component({
  templateUrl: './precios.component.html',
  styleUrls: ['./precios.component.scss']
})
export class PreciosComponent implements OnInit {

    constructor (
      public _auth: AuthService
  ) { }

  ngOnInit(): void {
  }

}
