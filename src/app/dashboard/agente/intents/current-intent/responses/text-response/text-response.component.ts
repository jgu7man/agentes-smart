import {
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { tap } from 'lodash';
import { fromEvent, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  pluck,
  startWith,
} from 'rxjs/operators';
import { iParamSelected } from 'src/app/models/intent.model';

@Component({
  selector: 'as-text-response',
  templateUrl: './text-response.component.html',
  styleUrls: ['./text-response.component.scss'],
})
export class TextResponseComponent implements AfterViewInit, OnDestroy {
  @Input() text!: string;
  textSub!: Subscription;
  selectParameter: boolean = false;
  paramSelected: iParamSelected = {value:''};
  @ViewChild('dialgbox') mensajeInput!: ElementRef;
  @Output() onTextEvent: EventEmitter<string> = new EventEmitter();

  constructor() {}

  ngAfterViewInit() {
    let splited = this.text.split('$');
    if (splited.length > 1) {
      this.paramSelected.value = splited[1].split(' ')[0];
    }
    this.listenText();
  }

  listenText() {
    this.textSub = fromEvent<KeyboardEvent>(
      this.mensajeInput.nativeElement,
      'keyup'
    )
      .pipe(
        map((event: KeyboardEvent) => {
          if (event.key == '$') this.selectParameter = true;
          return event;
        }),
        pluck<KeyboardEvent, string>('target', 'value'),
        startWith(this.text ? this.text : ''),
        debounceTime(1000),
        distinctUntilChanged()
      )

      .subscribe((text) => {
        this.text = text;
        this.onTextEvent.emit(this.text);
      });
  }

  catchParamSelected(param: iParamSelected) {
    this.text = this.text.replace('$', param.value);
    this.selectParameter = false;
  }

  ngOnDestroy() {
    this.textSub.unsubscribe();
  }
}
