import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { DeleteIntentDialog } from '../delete-intent/delete-intent.dialog';

@Component({
  selector: 'as-intent-header',
  templateUrl: './intent-header.component.html',
  styleUrls: ['./intent-header.component.scss']
})
export class IntentHeaderComponent implements OnInit {

  // mensaje: IntentModel
  switchEdit: boolean = false
  intentNameCtrl: FormControl = new FormControl( '' )

  stateSubs!: Subscription
  unsaved: boolean = false

  constructor (
    public currentIntent: CurrentIntentService,
    private _dialog: MatDialog,
    public location: Location,
  ) {
  }

  ngOnInit(): void {
  }



  updateDisplayName() {
    const intentState = this.currentIntent.state$.value
    if ( intentState ) {
      let displayName = intentState.displayName
      if ( displayName != this.intentNameCtrl.value ) {
        this.currentIntent.state$.next({
          ...intentState,
          displayName: this.intentNameCtrl.value,
          unsaved: true
        })
      }
      this.switchEdit = false

    }
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
