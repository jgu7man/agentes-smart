import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class IntentHeaderComponent implements OnInit, OnDestroy {

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
    this.stateSubs = this.currentIntent.current$
      .subscribe( state => {
        this.unsaved = state.unsaved
        this.intentNameCtrl.patchValue(state.displayName)
      } )
  }



  updateDisplayName() {
    let displayName = this.currentIntent.current$.value.displayName
    if ( displayName != this.intentNameCtrl.value ) {
      this.currentIntent.current$.next({
        ...this.currentIntent.current$.value,
        displayName: this.intentNameCtrl.value,
        unsaved: true
      })
    }
    this.switchEdit = false
  }

  toDelIntent() {
    this._dialog.open( DeleteIntentDialog, {
      minWidth: '400px',
      data: this.currentIntent.current$.getValue().name
    } ).afterClosed().subscribe( ( confirmation ) => {
      if (confirmation) this.location.back()
    } )
  }

  ngOnDestroy() {
    this.stateSubs.unsubscribe()
  }

}
