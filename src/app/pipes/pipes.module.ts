import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortPipe } from './sort.pipe';
import { ParamColorPipe } from './param-color.pipe';
import { TextResponsePipe } from './text-response.pipe';



@NgModule({
  declarations: [
    SortPipe,
    ParamColorPipe,
    TextResponsePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SortPipe,
    ParamColorPipe,
    TextResponsePipe
  ]
})
export class PipesModule { }
