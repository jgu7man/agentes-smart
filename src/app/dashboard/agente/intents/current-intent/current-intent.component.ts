import { ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MxAlert, MxResponsive } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CurrentIntentService } from 'src/app/services/current-intent.service';

@Component({
  templateUrl: './current-intent.component.html',
  styleUrls: ['./current-intent.component.scss']
})
export class CurrentIntentComponent implements OnInit, OnDestroy {
  private inIntentSubs!: Subscription
  private stateSubs!: Subscription
  public routeIntentName!: string
  private currentContext!: string
  @ViewChild('respuestas') respuestasPanel!: ElementRef;

  constructor (
    public responsive: MxResponsive,
    public _intent: CurrentIntentService,
    private router: Router,
    private _route: ActivatedRoute,
    private _alert: MxAlert
  ) {
    this.getCurrentIntent()
  }

  ngOnInit(): void {
    this.changeIntent()
    // this.stateSubs = this._intent.current$
    //   .subscribe( ( state ) => {
    //     if ( state ) {
    //       if ( state.unsaved == false ) {
    //         this.getCurrentIntent()
    //       }
    //     }
    // });
  }



  getCurrentIntent() {
    const route = this._route.snapshot.params[ 'name' ]
    this.routeIntentName = route == 'welcome' || route == 'fallback'
      ? route == 'welcome'
        ? 'Default Welcome Intent'
        : 'Default Fallback Intent'
      : route
    this.currentContext = this._route.snapshot.queryParams[ 'contexto' ]
    this._intent.set(this.routeIntentName, this.currentContext)

  }

  changeIntent() {
    this.inIntentSubs =
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


  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if ( this._intent.state$.value?.unsaved ) {
      this._alert.request( 'Hay cambias sin guardar. ¿Deseas guardarlos?', 'text', 'Sí', 'No' )
        .pipe(take( 1 ))
        .subscribe( confirmation => {
          if ( confirmation ) this._intent.saveChanges()
        } )
    }
  }


  ngOnDestroy(): void {
    this._intent.unsubscribe()
    this.inIntentSubs.unsubscribe()
    // this.stateSubs.unsubscribe()
    // console.log('unsubscribe');
  }
}
