import { NgModule } from '@angular/core';

import {
  MxColorsModule,
  MxResponsiveModule,
  MxDateTimeModule,
  MxTextModule,
} from "@marxa/devkit";
import { MxStorageModule } from '@marxa/storage';

@NgModule({
  exports: [
    MxColorsModule,
    MxResponsiveModule,
    MxDateTimeModule,
    MxTextModule,
    MxStorageModule
  ]
})
export class MarxaModule {}
