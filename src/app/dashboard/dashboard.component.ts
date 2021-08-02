import { Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatDrawer } from '@angular/material/sidenav';
import { MxCache, MxLoading, MxResponsive } from '@marxa/devkit';
import { DashboardService } from '../services/dashboard.service';
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

  public clientId: string = '';
  public projectId: string = '';

  private projectIdSubs!: Subscription;
  private sidenavSubs!: Subscription
  private routeDataSubs!: Subscription
  private inisializationSubs!: Subscription

  @ViewChild( 'sidenav' ) private sidenav!: MatDrawer

  constructor(
    public responsive_: MxResponsive,
    public dashboard_: DashboardService,
    private _loading: MxLoading,
    private _title: Title,
    private _cache: MxCache,
  ) {
    this.setTitles()
    this.listenNavbarToggle()
    this.inisializationSubs = this.dashboard_.initializeDashboard().subscribe()
  }

  async ngOnInit() {
    let user = await this._cache.getAsyncKey<firebase.User>('user')
    this.clientId = user?.uid || ''

    this.projectIdSubs =
      this._cache.listenForChanges<string>( 'projectId' )
        .subscribe( project => { this.projectId = project })
  }

  // # SET TITLE
  /** Toma los datos de las rutas y define títulos de la página */
  setTitles() {
    this.routeDataSubs =this._loading.collectRouteData()
      .subscribe((routeData: any) => {
        var section = routeData.data['section'];
        var page = routeData.data['page'];
        // console.log( page, section )
        this._title.setTitle(`${page}${section ? ' - ' + section : ''}`);
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
    this.inisializationSubs.unsubscribe()
    this.projectIdSubs.unsubscribe()
  }

}
