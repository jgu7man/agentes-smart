import { ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MxResponsive } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { CurrentIntentService } from 'src/app/services/current-intent.service';

@Component({
  templateUrl: './current-intent.component.html',
  styleUrls: ['./current-intent.component.scss']
})
export class CurrentIntentComponent implements OnInit, OnDestroy {
  mensajeName!: string
  // mensaje: IntentModel
  private inMensajeSubs!: Subscription
  private stateSubs!: Subscription
  private intentName!: string
  private currentContexto!: string
  @ViewChild('respuestas') respuestasPanel!: ElementRef;

  constructor (
    public responsive: MxResponsive,
    private router: Router,
    private _intent: CurrentIntentService,
    private _route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.getCurrentIntent()
    this.stateSubs = this._intent.current$
      .subscribe( ( state ) => {
        if ( state ) {
          if ( state.unsaved == false ) {
            this.getCurrentIntent()
          }
        }
    });
    this.updateMensaje()
  }

  getCurrentIntent() {
    this.intentName = this._route.snapshot.params['name']
    this.currentContexto = this._route.snapshot.queryParams['contexto']
    console.log(this.intentName, this.currentContexto);
    this._intent.setCurrent(this.intentName, this.currentContexto)

  }

  updateMensaje() {
    this.inMensajeSubs =
      this.router.events.subscribe( ( val ) => {
        if ( val instanceof NavigationEnd ) {
          console.log('update');

          this.getCurrentIntent()
        }
      })
  }

  onLastChange(position: number) {
    this.respuestasPanel.nativeElement.scrollTop = position
  }




  ngOnDestroy(): void {
    this._intent.unsubscribe()
    this.inMensajeSubs.unsubscribe()
    this.stateSubs.unsubscribe()
    // console.log('unsubscribe');
  }
}
