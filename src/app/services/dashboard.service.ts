import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, filter, flatMap, map } from 'rxjs/operators';
import { iNavlink } from '../models/navlink.interface';
import firebase from 'firebase/app'
import { AgenteModel } from '../models/agente.model';
import { AgentesService } from './agentes.service';
import { MxAlert, MxCache } from '@marxa/devkit';
import { ProductsService } from './products.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class DashboardService {

  /** Almacena la lista de links para el navbar movil */
  public mobileNavbar$: Subject<iNavlink[]> = new Subject()
  /** Emite eventos para activar el menu mobile */
  public toggleMobileMenu: EventEmitter<boolean> = new EventEmitter()
  /** Emite eventos para activaar o desactivar sidenav en la versión mobile */
  public toggleSidenav$: EventEmitter<null> = new EventEmitter()


  constructor(
    // private _agentes: AgentesService,
    private _cache: MxCache,
    private _alert: MxAlert,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {

   }

  initializeDashboard() {
    // return this._cache.listenForChanges
    //   <firebase.User>('user').pipe(
    //     // tap(console.log),
    //     filter(user => !!user),
    //     flatMap<firebase.User, Observable<AgenteModel[]>>( user => this._agentes.list$() ),
    //     catchError(error => {throw this._alert.error(`Error en cargando los agentes`, error)}),
    //     distinctUntilChanged<AgenteModel[]>((x, y) => x.length === y.length)

    //   )
  }


  // # SET MOBILE NAVBAR
  /** Define los links para el navbar mobile */
  setMobileNavbar(navbar: iNavlink[]) {
    return this.mobileNavbar$.next(navbar)
  }

  // # SWITCH MOBILE MENU
  /** Activador de menu mobile */
  switchMobileMenu() {
    this.toggleMobileMenu.emit(true)
  }

  collectRouteData(): Observable<{
    data: Object,
    params: Object,
    queryParams: Object
  }> {
    return this._router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this._route),
      map( ( route ) => {
        const routeData = { data: {}, params: {}, queryParams: {} };

        while ( route.firstChild ) {
          route = route.firstChild;
          routeData.data = {
            ...routeData.data,
            ...route.snapshot.data,
          };
          routeData.params = {
            ...routeData.params,
            ...route.snapshot.params,
          };
          routeData.queryParams = {
            ...routeData.queryParams,
            ...route.snapshot.queryParams,
          };


        }
        return routeData;
      })
      // filter(route => route.outlet === "primary")
    );
  }


}


