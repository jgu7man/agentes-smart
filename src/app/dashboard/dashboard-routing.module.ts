import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

import { AgenteComponent } from './agente/agente.component';
import { SetAgenteComponent } from './agentes-crud/set-agente/set-agente.component';
import { InicioComponent } from './inicio/inicio.component';
import { StartUiComponent } from './agente/start-ui/start-ui.component';
import { IntentsComponent } from './agente/intents/intents.component';
import { CurrentIntentComponent } from './agente/intents/current-intent/current-intent.component';
import { EntityTypesComponent } from './agente/entity-types/entity-types.component';
import { ConfigComponent } from './agente/config/config.component';
import { IntegrationsComponent } from './agente/integrations/integrations.component';
import { InteractionsComponent } from './agente/interactions/interactions.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, children: [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: InicioComponent, data:{page: 'Agente Smart - Dashboard'} },
    // { path: 'agentes', component: AgentesComponent, data: {page: 'Agentes'}},
    { path: 'crear_agente', component: SetAgenteComponent, data: {page: 'Crear agente'}},
    { path: 'editar_agente/:id', component: SetAgenteComponent, },
    { path: 'agente/:id', component: AgenteComponent, data: {section: 'Agente'}, children: [
      { path: '', redirectTo: 'flujo', pathMatch: 'full', },
      { path: 'start', component: StartUiComponent },
      { path: 'flujo', component: IntentsComponent },
      { path: 'interaccion/:name', component: CurrentIntentComponent, },
      { path: 'entidades', component: EntityTypesComponent },
      { path: 'configuraciones', component: ConfigComponent },
      // { path: 'opciones', component: OpcionesComponent },
      { path:  'integraciones', component: IntegrationsComponent },
      { path:  'interacciones', component: InteractionsComponent },
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
