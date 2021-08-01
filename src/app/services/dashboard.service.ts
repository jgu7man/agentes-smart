import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, filter, flatMap } from 'rxjs/operators';
import { iNavlink } from '../models/navlink.interface';
import firebase from 'firebase/app'
import { AgenteModel } from '../models/agente.model';
import { AgentesService } from './agentes.service';
import { MxAlert, MxCache } from '@marxa/devkit';
import { ProductsService } from './products.service';

@Injectable({providedIn: 'root'})
export class DashboardService {

  /** Almacena la lista de links para el navbar movil */
  public mobileNavbar$: Subject<iNavlink[]> = new Subject()
  /** Emite eventos para activar el menu mobile */
  public toggleMobileMenu: EventEmitter<boolean> = new EventEmitter()
  /** Emite eventos para activaar o desactivar sidenav en la versión mobile */
  public toggleSidenav$: EventEmitter<null> = new EventEmitter()


  constructor(
    private _agentes: AgentesService,
    private _cache: MxCache,
    private _alert: MxAlert,
  ) {

   }

  initializeDashboard() {
    return this._cache.listenForChanges
      <firebase.User>('user').pipe(
        // tap(console.log),
        filter(user => !!user),
        flatMap<firebase.User, Observable<AgenteModel[]>>( user => this._agentes.listenAgentes( user.uid ) ),
        catchError(error => {throw this._alert.error(`Error en cargando los agentes`, error)}),
        distinctUntilChanged<AgenteModel[]>((x, y) => x.length === y.length)

      )
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

}


