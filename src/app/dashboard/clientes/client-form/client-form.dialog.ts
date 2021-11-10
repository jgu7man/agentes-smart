import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { iClient } from 'src/app/models/agent-clients.model';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  templateUrl: './client-form.dialog.html',
  styleUrls: ['./client-form.dialog.scss']
})
export class ClientFormDialog implements OnInit {

  clientForm: FormGroup = new FormGroup( {
    name: new FormControl( '' ),
    email: new FormControl( '' ),
    phone: new FormControl( '' ),
    data: new FormControl( '' ),
  });
  hintMessage = `El formato de la data debe ser entre llaves {} y pares de campo y valor. Ej: { "campo": "valor"}`

  constructor (
    @Inject( MAT_DIALOG_DATA ) public client: iClient,
    public dialog: MatDialogRef<ClientFormDialog>,
    private _clients: ClientesService
  ) {
    if ( this.client ) {
      this.clientForm?.patchValue( {
        name: this.client.name || '',
        email: this.client.email || '',
        phone: this.client.phone || '',
        data: JSON.stringify( this.client.data ) || ''
      })
    } else {
      console.error('No se tiene el cliente');
    }
  }

  ngOnInit(): void {
  }

  async onSubmit() {
    let { name, email, phone, data } = this.clientForm.value
    this.client = {
      ...this.client,
      name, email, phone,
      data:JSON.parse(data)
    }
    await this._clients.save( this.client )
    this.dialog.close()
  }

}
