import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { EventEmitter, Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { MxAlert, MxLoading } from '@marxa/devkit';
import { iContextSelected } from 'src/app/models/context.model';
import { Sugerencia } from 'src/app/models/intent-response.model';

@Component({
  selector: 'as-suggest-response',
  templateUrl: './suggest-response.component.html',
  styleUrls: ['./suggest-response.component.scss']
})
export class SuggestResponseComponent implements OnInit {

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  newSuggest: Sugerencia = { text: '', context: undefined };

  @Input() sugerencias?: Sugerencia[];
  @Output() onSugerenciasChange: EventEmitter<Sugerencia[]> = new EventEmitter();

  constructor (
    private _alert: MxAlert,
    private _loading: MxLoading
  ) { }

  ngOnInit(): void {}

  onCatchTextMsg( text: string ) {
    if ( !this.sugerencias ) this.sugerencias = [];
    this.sugerencias.push(this.newSuggest);
    this.newSuggest = { text: '', context: undefined };
    console.log(this.sugerencias);
    this.onSugerenciasChange.emit(this.sugerencias);
  }

  addText(): void {
    if (!this.sugerencias) this.sugerencias = [];
    if (!this.newSuggest.context) {
      delete this.newSuggest.context;
    }
    this.sugerencias.push(this.newSuggest);
    this.newSuggest = { text: '', context: undefined };
    this.onSugerenciasChange.emit(this.sugerencias);
  }
  async addContext(selected: iContextSelected) {
    if (this.newSuggest.text) {
      if (!this.sugerencias) this.sugerencias = [];
      this.newSuggest.context = selected.context;
      this.sugerencias.push(this.newSuggest);
      await this._loading.waitFor(100);

      console.log(this.sugerencias);
      this.onSugerenciasChange.emit(this.sugerencias);
      this.newSuggest = { text: '', context: undefined };
    }
  }
  onEdit(suggest: Sugerencia, index: number) {
    console.log(this.newSuggest.context != undefined);
    console.log(this.newSuggest.text != '');

    if (this.newSuggest.context != undefined || this.newSuggest.text != '') {
      console.log(this.newSuggest.context);
      console.log(this.newSuggest.text);
      this._alert.message(
        'Tienes una sugerencia pendiente de agregar'
      );
    } else {
      this.remove(index);
      this.newSuggest = suggest;
    }
  }

  remove(index: number): void {
    if (index >= 0) {
      this.sugerencias?.splice(index, 1);
      this.onSugerenciasChange.emit(this.sugerencias);
    }
  }

}
