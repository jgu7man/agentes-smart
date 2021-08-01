import { Component } from '@angular/core';
import { MxAlert, MxColor, MxText } from "@marxa/devkit";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private _color: MxColor,
    private _text: MxText,
    private _alert: MxAlert
  ) {
    this._alert.storeError = false
    this._text.loadFontAwesome()
    this._color.ColorPalette = {
      main: '#3079F1',
      accent: '#EFA130',
      dark1: '#141e66',
      dark2: '#001d4d',
      dark3: '#000a1a',
      ligth1: '#CCE1FF',
      ligth2: '#FFF4E6',
      ligth3: '#F3F8FF',
    }
  }


}
