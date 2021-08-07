import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import firebase from 'firebase/app'
import { MxAuth } from '@marxa/auth';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MxCache, MxLoading } from '@marxa/devkit';
import { MatDialog } from '@angular/material/dialog';
import { LoginAdviceDialog } from './login-advice/login-advice.dialog';

@Component({
  selector: 'as-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  /** Almacena y valida el usuario autenticado*/
  public user!: firebase.User | null;
  /** Almacena la vista pública y define la vista de la aplicación */
  public view?: string
  /** Observa los cambios en la página */
  private onPageChangeSubs$?: Subscription;

  constructor(
    public auth_: MxAuth,
    // public dashboard: DashboardService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _loading: MxLoading,
    private _cache: MxCache,
    private _dialog: MatDialog,
  ) {
    // NOTE Carga por primera y unica vez el usuario
    this.auth_.user$.subscribe((user) => {
        this._cache.updateData('user', user);
    });
    this.getCurrentPage();
    this._loading.getCurrentActivatedRoute().subscribe(() => {
      this._loading.collectRouteData().subscribe((data: any) => {
        this.view = data.data['page'];
        // console.log( this.view )
      });
    })
  }


  async ngOnInit() {
    this.user = await this._cache.getAsyncKey<firebase.User>('user');
    // this.updatePage();
  }

  async getCurrentPage() {
    this._loading.collectRouteData().subscribe((data: any) => {
      this.view = data.data['page'];
    });
  }

  openDialog(): void {
    this._dialog.open(LoginAdviceDialog, {
      width: '350px',
    }).afterClosed().subscribe( () => {
      this.auth_.googleSingIn().then( () => {
          this._router.navigate(['/dashboard'])
      })
    });
  }

  // REVIEW No usarla no genera errores?
  private _updatePage() {
    this.onPageChangeSubs$ = this._router.events.subscribe(async (val) => {
      if (val instanceof NavigationEnd) {
        await this.getCurrentPage();
      }
    });
  }


  get initPosition() {
    if (this.view === 'home') {
      if (window.scrollY === 0) {
          return true;
      } else {
          return false;
      }
    } else {
      return false;
    }
  }
}
