import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseTypeDirective } from './response-type.directive';
import { CatchContextDirective, ConditionalContextDirective, DefaultContextDirective, SearchContextDirective } from '../models/intent-response.model';
import { DiagramElementDirective } from './diagram-element.directive';
import { FocusOnShowDirective } from './focus-on-show.directive';



@NgModule({
  declarations: [
    ResponseTypeDirective,
    ConditionalContextDirective,
    CatchContextDirective,
    SearchContextDirective,
    DefaultContextDirective,
    DiagramElementDirective,
    FocusOnShowDirective
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
    DiagramElementDirective,
    FocusOnShowDirective
  ]
})
export class DirectivesModule { }
