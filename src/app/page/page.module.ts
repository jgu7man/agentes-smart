import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageRoutingModule } from './page-routing.module';
import { PageComponent } from './page.component';
import { SharedModule } from '../shared/shared.module';
import { LoginAdviceDialog } from './navbar/login-advice/login-advice.dialog';
import { NavbarComponent } from './navbar/navbar.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { LegalComponent } from './pages/legal/legal.component';
import { PreciosComponent } from './pages/precios/precios.component';
import { TratamientoDatosComponent } from './pages/legal/tratamiento-datos/tratamiento-datos.component';
import { DocsComponent } from './pages/docs/docs.component';
import { MessengerIntegrationComponent } from './pages/docs/messenger-integration/messenger-integration.component';


@NgModule({
  declarations: [
    PageComponent,
    LoginAdviceDialog,
    NavbarComponent,
    InicioComponent,
    LegalComponent,
    PreciosComponent,
    TratamientoDatosComponent,
    DocsComponent,
    MessengerIntegrationComponent
  ],
  imports: [
    CommonModule,
    PageRoutingModule,
    SharedModule,
  ]
})
export class PageModule { }
