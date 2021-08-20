import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseTypeDirective } from './response-type.directive';
import { CatchContextDirective, ConditionalContextDirective, DefaultContextDirective, SearchContextDirective } from '../models/intent-response.model';



@NgModule({
  declarations: [
    ResponseTypeDirective,
    ConditionalContextDirective,
    CatchContextDirective,
    SearchContextDirective,
    DefaultContextDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ResponseTypeDirective,
    ConditionalContextDirective,
    CatchContextDirective,
    SearchContextDirective,
    DefaultContextDirective
  ]
})
export class DirectivesModule { }
