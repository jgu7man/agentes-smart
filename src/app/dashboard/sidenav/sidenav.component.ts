import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AgentesService } from 'src/app/services/agentes.service';
import { MxResponsive } from '@marxa/devkit';

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
    public _agentes: AgentesService,
    public responsive: MxResponsive
  ) {
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
      {
        name: 'Cuenta',
        route: 'cuenta',
        routeId: 'cuenta',
        icon: 'fa-receipt',
      },
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
