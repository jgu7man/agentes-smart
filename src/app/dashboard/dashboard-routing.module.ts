import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

import { AgenteComponent } from './agente/agente.component';
import { SetAgenteComponent } from './agentes-crud/set-agente/set-agente.component';
import { InicioComponent } from './inicio/inicio.component';
// import { AgentConfigComponent } from './agente/agent-config/agent-config.component';
// import { BienvenidaComponent } from './agente/bienvenida/bienvenida.component';
// import { ConversacionesComponent } from './agente/conversaciones/conversaciones.component';
// import { IntegracionesComponent } from './agente/integraciones/integraciones.component';
// import { MensajeComponent } from './agente/mensajes/mensaje/mensaje.component';
// import { MensajesComponent } from './agente/mensajes/mensajes.component';
// import { OpcionesComponent } from './agente/opciones/opciones.component';
// import { StartUiComponent } from './agente/start-ui/start-ui.component';
// import { TiposComponent } from './agente/tipos/tipos.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, children: [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: InicioComponent, data:{page: 'Agente Smart - Dashboard'} },
    // { path: 'agentes', component: AgentesComponent, data: {page: 'Agentes'}},
    { path: 'crear_agente', component: SetAgenteComponent, data: {page: 'Crear agente'}},
    { path: 'editar_agente/:id', component: SetAgenteComponent, },
    { path: 'agente/:id', component: AgenteComponent, data: {section: 'Agente'}, children: [
    //   // { path: '', redirectTo: 'flujo', pathMatch: 'full', },
    //   // { path: 'start', component: StartUiComponent },
    //   // { path: 'mensaje/bienvenida', component: BienvenidaComponent },
    //   // { path: 'flujo', component: MensajesComponent },
    //   // { path: 'mensaje/:name', component: MensajeComponent, },
    //   // { path: 'tipos', component: TiposComponent },
    //   // { path: 'configuraciones', component: AgentConfigComponent },
    //   // { path: 'opciones', component: OpcionesComponent },
    //   // { path:  'integraciones', component: IntegracionesComponent },
    //   // { path:  'conversaciones', component: ConversacionesComponent },
    ],},
    // { path: 'tarjetas', component: TarjetasComponent },
    // { path: 'colecciones', component: ColeccionesComponent },

    // { path: 'inventario', component: ProductsComponent },
    // { path: 'importar', component: ImportarComponent },
    // { path: 'products/add', component: AddProductComponent },
    // { path: 'products/edit/:id',component: EditProductComponent },
    // { path: 'clientes', component: ClientesComponent },
  ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
