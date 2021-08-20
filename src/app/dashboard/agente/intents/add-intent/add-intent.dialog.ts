import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MxCache, MxLoading } from '@marxa/devkit';
import { iContextList, iContextSelected } from 'src/app/models/context.model';
import { iIntentState } from 'src/app/models/intent.model';
import { IntentsService } from 'src/app/services/intents.service';

@Component({
  selector: 'as-add-intent',
  templateUrl: './add-intent.dialog.html',
  styleUrls: ['./add-intent.dialog.scss'],
})
export class AddIntentDialog implements OnInit {
  switchAddIntent: boolean = false;
  lastIndex: number = 0;
  newIntent: string = '';
  context: string = '';

  constructor(
    private _loading: MxLoading,
    private _cache: MxCache,
    private _intents: IntentsService,
    public dialog: MatDialogRef<AddIntentDialog>
  ) {}

  ngOnInit(): void {}

  catchContextSelected(selected: iContextSelected) {
    this.context = selected.context;
    const contextLists = this._cache.getDataKey<iContextList>('contextosLists');
    if (contextLists) {
      const contextListSelected: iIntentState[] =
        contextLists[selected.context];
      this.lastIndex = contextListSelected.length
        ? contextListSelected.length
        : 0;
      console.log(this.lastIndex);
    }
  }

  async onAddIntent() {
    this._loading.toggleWaiting('open');
    this.switchAddIntent = false;

    if (this.newIntent) {
      await this._intents.create(
        this.newIntent,
        this.lastIndex,
        this.context ? this.context : undefined
      );
      this.dialog.close(this.newIntent);
    }
  }
}
