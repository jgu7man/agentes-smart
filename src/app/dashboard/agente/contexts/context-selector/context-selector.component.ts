import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MxCache } from '@marxa/devkit';
import { take } from 'rxjs/operators';
import { iContext, iContextList, iContextSelected } from 'src/app/models/context.model';
import { iIntentState } from 'src/app/models/intent.model';
import { ContextsService } from 'src/app/services/contexts.service';
import { AddContextDialog } from '../add-context/add-context.dialog';

@Component({
  selector: 'as-context-selector',
  templateUrl: './context-selector.component.html',
  styleUrls: ['./context-selector.component.scss'],
})
export class ContextSelectorComponent implements OnInit {
  contextLists: iContextList | null = null;
  contextNameList: string[] = [];
  nuevoContexto!: iContext;

  @Input() contexto!: string;
  @Input() allowCreate: boolean = true;
  @Output() contextSelected: EventEmitter<iContextSelected> =
    new EventEmitter();

  constructor (
    private _cache: MxCache,
    private _dialog: MatDialog,
    private _contexts: ContextsService
  ) {

  }

  ngOnInit(): void {
    this.getContextList();
    // console.log(this.contexto);
  }

  async getContextList() {
    this.contextLists = this._cache.getDataKey<iContextList>('contextosLists');
    if (this.contextLists) {
      this.contextNameList = Object.keys(this.contextLists);
    } else {
      let agenteContext = await this._contexts.list$.pipe( take( 1 ) ).toPromise()
      console.log(agenteContext);
      if (agenteContext) {
        this.contextNameList = agenteContext.map(
          (context) => context.contextName
        );
      } else {
        this.contextNameList = [];
      }
    }
    this.nuevoContexto = {
      contextName: '',
      lifespanCount: 3,
      index: this.contextNameList.length || 0,
    };

  }

  catchContextSelected(selection: MatSelectChange) {
    let context = selection.value;
    let continueIntents: iIntentState[] = [];
    if (this.contextLists) {
      continueIntents = this.contextLists[context];
    }
    // console.log( {context, continueIntents} )
    this.contextSelected.emit({ context, continueIntents });
  }

  openContextCreator() {
    var dialog = this._dialog.open(AddContextDialog, {
      minWidth: 300,
      data: this.nuevoContexto,
    });

    dialog.afterClosed().subscribe((result: iContext) => {
      if (result) this.contextNameList.push(result.contextName);
    });
  }
}
