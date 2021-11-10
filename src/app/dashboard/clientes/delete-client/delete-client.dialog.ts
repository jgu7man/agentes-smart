import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  templateUrl: './delete-client.dialog.html',
  styleUrls: ['./delete-client.dialog.scss']
})
export class DeleteClientDialog implements OnInit {

  constructor (
    @Inject( MAT_DIALOG_DATA ) private cid: string,
    public dialog: MatDialogRef<DeleteClientDialog>,
    private _clientes: ClientesService
  ) { }

  ngOnInit(): void {

  }

  async onSubmit() {
    await this._clientes.delete( this.cid )
    this.dialog.close(true)
  }

}
