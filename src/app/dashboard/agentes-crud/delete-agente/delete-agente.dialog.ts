import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './delete-agente.dialog.html',
  styleUrls: ['./delete-agente.dialog.scss']
})
export class DeleteAgenteDialog implements OnInit {

  constructor (
    public dialog: MatDialogRef<DeleteAgenteDialog>
  ) { }

  ngOnInit(): void {
  }

}
