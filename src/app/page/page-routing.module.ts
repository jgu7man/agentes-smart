import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './page.component';
import { DocsComponent } from './pages/docs/docs.component';
import { MessengerIntegrationComponent } from './pages/docs/messenger-integration/messenger-integration.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { LegalComponent } from './pages/legal/legal.component';
import { TratamientoDatosComponent } from './pages/legal/tratamiento-datos/tratamiento-datos.component';
import { PreciosComponent } from './pages/precios/precios.component';

const routes: Routes = [
  { path: '', component: PageComponent, children:[
    {path: '', redirectTo: 'inicio', pathMatch: 'full'},
    {path: 'inicio', component: InicioComponent, data: {page: 'home'}, },
    {path: 'docs', component: DocsComponent, data: {page: 'docs'}, children:[
      { path: 'messenger-integration', component: MessengerIntegrationComponent, data: {page: 'messenger-integration'}}
    ]},
    { path: 'legal', component: LegalComponent,data: {page: 'Legal'}, children: [
      { path: 'tratamiento-de-datos', component: TratamientoDatosComponent, data:{page:'tratamiento_datos'} },
    ] },
    { path: 'precios', component: PreciosComponent, data: {page: 'Precios'}}
  ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageRoutingModule { }
