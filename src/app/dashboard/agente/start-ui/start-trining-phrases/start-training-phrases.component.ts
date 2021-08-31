import { Observable, Subscription } from 'rxjs';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { iIntentState } from 'src/app/models/intent.model';
import { MxAlert, MxCache, MxResponsive } from '@marxa/devkit';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'as-start-training-phrases',
  templateUrl: './start-training-phrases.component.html',
  styleUrls: ['./start-training-phrases.component.scss'],
})
export class StartTrainingPhrasesComponent implements OnInit {
  intent$: Observable<iIntentState> = new Observable();
  stateSubs: Subscription;
  unsaved: boolean = false;
  listenSaved: boolean = false;

  @Output() saved = new EventEmitter<any>();
  constructor(
    public responsive: MxResponsive,
    public mensaje_: CurrentIntentService,
    private _alerts: MxAlert,
    private _cache: MxCache
  ) {
    this.stateSubs =
      this.mensaje_.state$.subscribe( state => {
        if ( state ) {
          this.unsaved = state.unsaved as boolean;
          if (this.listenSaved && !this.unsaved) {
            this.saved.emit();
          } else if (this.unsaved == false) {
            this.getWelcomeIntent();
          } else {
            this.listenSaved = true;
          }
          console.log('unsaved:', this.unsaved);
      }
    })

  }

  ngOnInit(): void {

  }

  async getWelcomeIntent() {
    this.intent$ = this._cache.listenForChanges<iIntentState>('currentIntent');
    await this.mensaje_.set('Default Welcome Intent');
    // await this.intent$.pipe(take(1)).toPromise()
    // this._loading.toggleWaitingSpinner(false)
  }

  async setIntent() {
    this._alerts.message(
      'No se encontró el intent de bienvenida. Restáuralo en las configuraciones del agente.'
    );
  }

  ngOnDestroy() {
    this.stateSubs.unsubscribe();
    this.mensaje_.unsubscribe();
  }
}
