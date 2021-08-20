import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CurrentIntentService } from 'src/app/services/current-intent.service';

@Component({
  templateUrl: './delete-intent.dialog.html',
  styleUrls: ['./delete-intent.dialog.scss']
})
export class DeleteIntentDialog implements OnInit {

  constructor (
    public dialog: MatDialogRef<DeleteIntentDialog>,
    @Inject( MAT_DIALOG_DATA ) public intentName: string,
    public currentIntent: CurrentIntentService
  ) { }

  ngOnInit(): void {
  }

}
