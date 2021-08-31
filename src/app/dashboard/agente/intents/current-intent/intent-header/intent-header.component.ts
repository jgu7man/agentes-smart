import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { DeleteIntentDialog } from '../delete-intent/delete-intent.dialog';

@Component({
  selector: 'as-intent-header',
  templateUrl: './intent-header.component.html',
  styleUrls: ['./intent-header.component.scss']
})
export class IntentHeaderComponent implements OnInit {

  public switchEdit: boolean = false
  public intentNameCtrl: FormControl = new FormControl( '' )

  constructor (
    public currentIntent: CurrentIntentService,
    private _dialog: MatDialog,
    public location: Location,
  ) {
  }

  ngOnInit(): void {
  }

  updateDisplayName() {
    this.currentIntent.change('displayName', this.intentNameCtrl.value)
    this.switchEdit = false
  }

  toDelIntent() {
    this._dialog.open( DeleteIntentDialog, {
      minWidth: '400px',
      data: this.currentIntent.state$.value?.name || ''
    } ).afterClosed().subscribe( ( confirmation ) => {
      if (confirmation) this.location.back()
    } )
  }

}
