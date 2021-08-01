import { NgModule } from '@angular/core';

import {
  MxColorsModule,
  MxResponsiveModule,
  MxDateTimeModule,
  MxTextModule,
} from "@marxa/devkit";

@NgModule({
  exports: [
    MxColorsModule,
    MxResponsiveModule,
    MxDateTimeModule,
    MxTextModule,
  ]
})
export class MarxaModule {}
