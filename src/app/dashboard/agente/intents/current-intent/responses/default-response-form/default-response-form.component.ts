import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
// import { DefaultResponseModel, Sugerencia } from 'src/app/models/intent-response.model';
import { iResponseResult } from 'src/app/models/response.model';
import { ResponsesService } from 'src/app/services/responses.service';

@Component({
  selector: 'as-default-response-form',
  templateUrl: './default-response-form.component.html',
  styleUrls: ['./default-response-form.component.scss']
})
export class DefaultResponseFormComponent implements OnInit {

  @Input() result: iResponseResult;

  @Output() onRespChanges: EventEmitter<iResponseResult> = new EventEmitter();
  @Output() toggleSugerencias: EventEmitter<boolean> = new EventEmitter()

  switchSuggestions: boolean = false;

  constructor(public resService: ResponsesService) {
      this.result= { response: '', suggestions: [] };
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


  catchText(text: string) {
    this.result.response = text
    this.onRespChanges.emit(this.result);
  }

  catchSugerencias(sugerencias: string[]) {
      this.result.suggestions = sugerencias
      console.log( this.result.suggestions )
      this.onRespChanges.emit(this.result);
  }

}
