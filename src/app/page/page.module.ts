import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageRoutingModule } from './page-routing.module';
import { PageComponent } from './page.component';
import { SharedModule } from '../shared/shared.module';
import { LoginAdviceDialog } from './navbar/login-advice/login-advice.dialog';
import { NavbarComponent } from './navbar/navbar.component';


@NgModule({
  declarations: [
    PageComponent,
    LoginAdviceDialog,
    NavbarComponent
  ],
  imports: [
    CommonModule,
    PageRoutingModule,
    SharedModule,
  ]
})
export class PageModule { }
