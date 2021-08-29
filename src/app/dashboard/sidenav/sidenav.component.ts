import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AgentsService } from 'src/app/services/agents.service';
import { MxCache, MxResponsive } from '@marxa/devkit';
import { MxAuth } from '@marxa/auth';

@Component({
  selector: 'as-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  agenteRoutes = [];
  agentes: CHILD[] = [];
  Sidenav: PARENT[] = [];
  constructor(
    private location: Location,
    public _agents: AgentsService,
    public responsive: MxResponsive,
    public auth: MxAuth,
    private _cache: MxCache,
  ) {
    this.auth.unloggedPath = '/'
    this.agenteRoutes = [];
  }

  ngOnInit() {
    this.setSidenav();
  }

  onActive(path: string) {
    return this.location.path().includes(path);
  }

  checkResponsive() {
    return this.responsive.med || this.responsive.small;
  }

  onSignOut() {
    this._cache.deleteDataKey( 'user' )
    this._cache.deleteDataKey( 'userId')
    this.auth.signOut()
  }

  setSidenav() {
    this.Sidenav = [
      {
        name: 'Agente',
        route: '/dashboard/agentes',
        routeId: 'agentes',
        icon: 'fa-project-diagram',
        childs: [
          // {
          //   name: 'Crear agente',
          //   route: '/dashboard/crear_agente',
          //   routeId: 'crear_agente',
          // },
          // {
          //   name: 'Agentes creados',
          //   route: '/dashboard/agentes',
          //   routeId: 'agentes',
          // },
        ],
      },
      {
        name: 'Colecciones',
        route: 'colecciones',
        routeId: 'clientes',
        icon: 'fa-folder',
      },
      {
        name: 'Tarjetas',
        route: 'tarjetas',
        routeId: 'clientes',
        icon: 'fa-window-restore',
      },
      {
        name: 'Inventario',
        route: 'inventario',
        routeId: 'inventario',
        icon: 'fa-boxes',
        childs: [
          {
            name: 'Importar',
            route: '/dashboard/importar',
            routeId: 'importar',
          },
        ]
      },
      // { name: 'Integraciones', route: 'integraciones', routeId: 'integraciones', icon: 'fa-plug' },
      {
        name: 'Clientes',
        route: 'clientes',
        routeId: 'clientes',
        icon: 'fa-users',
      },
      // {
      //   name: 'Cuenta',
      //   route: 'cuenta',
      //   routeId: 'cuenta',
      //   icon: 'fa-receipt',
      //   childs: [
      //     {
      //       name: 'Cerrar sesión',
      //       route: '/dashboard/crear_agente',
      //       routeId: 'crear_agente',
      //     },
      //   ]
      // },
    ];
  }
}

interface PARENT {
  name: string;
  route: string;
  routeId: string;
  childs?: CHILD[];
  icon?: string;
}

interface CHILD {
  name: string;
  route: string;
  routeId: string;
}
