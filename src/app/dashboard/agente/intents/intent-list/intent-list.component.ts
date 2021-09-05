import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MxLoading } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { iContext } from 'src/app/models/context.model';
import { DiagramProps } from 'src/app/models/diagram-data.interface';
import { iIntentState } from 'src/app/models/intent.model';
import { ContextsService } from 'src/app/services/contexts.service';
import { IntentsService } from 'src/app/services/intents.service';

@Component({
  selector: 'as-intent-list',
  templateUrl: './intent-list.component.html',
  styleUrls: ['./intent-list.component.scss']
})
export class IntentListComponent implements OnInit, OnDestroy {

  public intentNameCtrl = new FormControl('', [Validators.required])
  public switchAddIntent: boolean = false;
  public intents: iIntentState[] = [];

  @Input() contexto?: iContext;
  @ViewChild('intentNameInput') intentNameInput!: ElementRef;
  private listSubscription!: Subscription

  constructor(
    private _loading: MxLoading,
    private _intents: IntentsService,
    // public diagram_: DiagramService,
    private _contexts: ContextsService
  ) {


  }

  async ngOnInit() {
    this.listSubscription = ( this.contexto
      ? this._intents.getByContext$( this.contexto.name )
      : this._intents.getWithoutContext$()
    ).subscribe( async ( list ) => {
      this.intents = list;
      if ( this.contexto ) {
        await this._loading.waitFor( this.contexto.index * 1000 )
        this._contexts.setContextosList( this.contexto.name, list );
      }
    } );
  }


  trackByName(index: number, intent: iIntentState) {
    return intent.name;
  }

  async toAddIntent() {
    this.switchAddIntent = !this.switchAddIntent;
    await this._loading.waitFor(100);
    this.intentNameInput.nativeElement.focus();
  }

  async onAddIntent(contexto?: string) {
    this._loading.toggleWaiting('open');
    this.switchAddIntent = false;
    if (!this.intents) this.intents = [];

    if (this.intentNameCtrl.valid) {
      let lastIndex = this.intents.length;
      // console.log(`creado ${this.newIntent}, index: ${lastIndex}`);
      await this._intents.create(this.intentNameCtrl.value, lastIndex, contexto);
    }
  }

  async setDiagramaData(props: DiagramProps, id: string) {
    // this.diagram_.object$.next({
    //   props,
    //   id,
    //   anchors: await this.mensajes_.getNextMensajes(id),
    // });
  }

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.intents, event.previousIndex, event.currentIndex);
    console.log(this.intents);
    this._intents.orderContextIntents(this.intents)
  }


  ngOnDestroy() {
    if (this.listSubscription) this.listSubscription.unsubscribe();
  }

}
