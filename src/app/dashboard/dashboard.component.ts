import { Observable, Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatDrawer } from '@angular/material/sidenav';
import { MxAlert, MxCache, MxLoading, MxResponsive } from '@marxa/devkit';
import { DashboardService } from '../services/dashboard.service';
import { MxAuth } from '@marxa/auth';
import { filter, map, take, tap } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import firebase from 'firebase/app'

@Component({
    // selector: 'as-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy{
  /** Almacena el valor de la sección y define si se habilita el ChatTester */
  public section: string = '';
  public page: string = ''

  public clientId!: string;
  public projectId?: string;

  private projectIdSubs!: Subscription;
  private sidenavSubs!: Subscription
  private routeDataSubs!: Subscription
  private inisializationSubs!: Subscription

  @ViewChild( 'sidenav' ) private sidenav!: MatDrawer

  constructor(
    public responsive_: MxResponsive,
    public dashboard_: DashboardService,
    public auth: MxAuth,
    private _loading: MxLoading,
    private _router: Router,
    private _cache: MxCache,
    private _alert: MxAlert,
    private _title: Title,
    private _route: ActivatedRoute,
  ) {
    this.listenNavbarToggle()
    this.setTitles()
    // this.inisializationSubs = this.dashboard_.initializeDashboard().subscribe()
    this.auth.user$.pipe(
      take(1)
    ).subscribe( (user: firebase.User) => {
      // console.log( user )
      if ( !user ) {
        this._alert.notify('Necesitas iniciar sesión')
        this._router.navigate( [ '/' ] )
      } else {
        this._cache.updateData('userId', user.uid)
        this.clientId = user.uid
      }
    } )
  }

  async ngOnInit() {
    this.listenForProjectId()
  }

  listenForProjectId() {
    this.projectIdSubs =
      this._cache.listenForChanges<string>( 'projectId' )
        .subscribe( project => { this.projectId = project })
  }

  // # SET TITLE
  /** Toma los datos de las rutas y define títulos de la página */
  setTitles() {
    this.routeDataSubs =this.dashboard_.collectRouteData()
      .subscribe( ( routeData: any ) => {
        // console.log( routeData )
        var section = routeData.data['section'];
        var page = routeData.data['page'];
        // console.log( page, section )
        this._title.setTitle(`${page ? page : 'Agente Smart'}${section ? ' - ' + section : ''}`);
        this.section = section;
      });
  }



  // # LISTEN NAVBAR TOGGLE
  /** Escucha los llamados para abrir o cerrar el Sidenav */
  listenNavbarToggle() {
     this.sidenavSubs = this.dashboard_.toggleSidenav$
      .subscribe(() => { this.sidenav.toggle() })
  }

  ngOnDestroy() {
    this.sidenavSubs.unsubscribe()
    this.routeDataSubs.unsubscribe()
    // this.inisializationSubs.unsubscribe()
    this.projectIdSubs.unsubscribe()
  }

}
