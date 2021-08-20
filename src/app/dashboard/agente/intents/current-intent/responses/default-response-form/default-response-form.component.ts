import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SimpleModel, Sugerencia } from 'src/app/models/intent-response.model';
import { RespuestasService } from 'src/app/services/respuestas.service';

@Component({
  selector: 'as-default-response-form',
  templateUrl: './default-response-form.component.html',
  styleUrls: ['./default-response-form.component.scss']
})
export class DefaultResponseFormComponent implements OnInit {

  @Input() result: SimpleModel;

  @Output() onRespChanges: EventEmitter<SimpleModel> = new EventEmitter();
  @Output() toggleSugerencias: EventEmitter<boolean> = new EventEmitter()

  switchSuggestions: boolean = false;

  constructor(public resService: RespuestasService) {
      this.result = new SimpleModel('', [], false);
  }

  ngOnInit(): void {
      if (this.result.suggestions && this.result.suggestions.length > 0) {
          this.switchSuggestions = true
      }
  }

  toggleSuggestions(change: MatSlideToggleChange) {
      this.switchSuggestions = change.checked;
      this.toggleSugerencias.emit(change.checked)
  }

  toggleAsdefault(change: MatSlideToggleChange) {
      this.result.asDefault = change.checked;
      this.onRespChanges.emit(this.result);
  }

  catchText(text: string) {
      this.result.text = text
      this.onRespChanges.emit(this.result);
  }

  catchSugerencias(sugerencias: Sugerencia[]) {
      this.result.suggestions = sugerencias
      console.log( this.result.suggestions )
      this.onRespChanges.emit(this.result);
  }

}
