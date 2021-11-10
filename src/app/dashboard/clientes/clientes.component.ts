import { Component, OnInit } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {

  defaultAvatar = '/assets/icons/user-icon-256x256.png'
  constructor (
    public clients: ClientesService
  ) { }

  ngOnInit(): void {
    // this.clients.list$.subscribe(clients => console.log( clients ))
  }

}
