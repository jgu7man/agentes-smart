import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ChatModule } from '../chat/chat.module';
import { AgenteComponent } from './agente/agente.component';
import { CreatingAgenteDialog } from './agente/creating-agente/creating-agente.dialog';
import { AgentesCrudComponent } from './agentes-crud/agentes-crud.component';
import { SetAgenteComponent } from './agentes-crud/set-agente/set-agente.component';
import { InicioComponent } from './inicio/inicio.component';
import { DeleteAgenteDialog } from './agentes-crud/delete-agente/delete-agente.dialog';


@NgModule({
  declarations: [
    DashboardComponent,
    SidenavComponent,
    AgenteComponent,
    CreatingAgenteDialog,
    AgentesCrudComponent,
    SetAgenteComponent,
    InicioComponent,
    DeleteAgenteDialog,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    ChatModule,
  ]
})
export class DashboardModule { }
