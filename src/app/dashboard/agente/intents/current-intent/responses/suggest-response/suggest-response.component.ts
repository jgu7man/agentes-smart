import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { EventEmitter, Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
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

  @Input() sugerencias: string[] = [];
  @Output() onSugerenciasChange: EventEmitter<string[]> = new EventEmitter();

  constructor (
    private _alert: MxAlert,
    private _loading: MxLoading
  ) { }

  ngOnInit(): void {}

  addSuggest(event: MatChipInputEvent) {
    let value = event.value.trim()
    if ( value ) this.sugerencias.push( value );
    event.input.value = ''
    this.onSugerenciasChange.emit(this.sugerencias)
  }

  removeSuggest(suggest: string) {
    let index = this.sugerencias.indexOf( suggest )
    this.sugerencias.splice( index, 1 );
    this.onSugerenciasChange.emit(this.sugerencias)
  }



}
