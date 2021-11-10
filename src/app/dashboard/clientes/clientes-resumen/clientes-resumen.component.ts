import { Component, OnInit } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'as-clientes-resumen',
  templateUrl: './clientes-resumen.component.html',
  styleUrls: ['./clientes-resumen.component.scss']
})
export class ClientesResumenComponent implements OnInit {

  public total: number = 0;
  public nuevos: number = 0;
  public fallbacked: number = 0;
  constructor (
    private _clientes: ClientesService
  ) { }

  ngOnInit(): void {
    this._clientes.list$.subscribe( list => {
      this.total = list.length
      this.nuevos = list.filter( c => c.isNew ).length
      this.fallbacked = list.filter(c => c.wasFalback).length
    })
  }

}
