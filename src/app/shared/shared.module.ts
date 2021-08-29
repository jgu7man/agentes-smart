import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { FirebaseModule } from './firebase.module';
import { MarxaModule } from './marxa.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DirectivesModule } from '../directives/directives.module';
import { PipesModule } from '../pipes/pipes.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FirebaseModule,
    MaterialModule,
    MarxaModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DirectivesModule,
    PipesModule,
  ],
  exports: [
    FirebaseModule,
    MaterialModule,
    MarxaModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DirectivesModule,
    PipesModule
  ]
})
export class SharedModule { }
