import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortPipe } from './sort.pipe';
import { ParamColorPipe } from './param-color.pipe';



@NgModule({
  declarations: [
    SortPipe,
    ParamColorPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SortPipe,
    ParamColorPipe
  ]
})
export class PipesModule { }
