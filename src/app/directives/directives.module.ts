import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseTypeDirective } from './response-type.directive';
import { CatchContextDirective, ConditionalContextDirective, DefaultContextDirective, SearchContextDirective } from '../models/intent-response.model';
import { DiagramElementDirective } from './diagram-element.directive';



@NgModule({
  declarations: [
    ResponseTypeDirective,
    ConditionalContextDirective,
    CatchContextDirective,
    SearchContextDirective,
    DefaultContextDirective,
    DiagramElementDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ResponseTypeDirective,
    ConditionalContextDirective,
    CatchContextDirective,
    SearchContextDirective,
    DefaultContextDirective,
    DiagramElementDirective
  ]
})
export class DirectivesModule { }
