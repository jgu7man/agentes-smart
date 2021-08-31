import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IntentsService } from 'src/app/services/intents.service';

@Component({
  templateUrl: './delete-intent.dialog.html',
  styleUrls: ['./delete-intent.dialog.scss']
})
export class DeleteIntentDialog implements OnInit {

  constructor (
    public dialog: MatDialogRef<DeleteIntentDialog>,
    @Inject( MAT_DIALOG_DATA ) public intentName: string,
    public intents: IntentsService
  ) { }

  ngOnInit(): void {
  }

}
