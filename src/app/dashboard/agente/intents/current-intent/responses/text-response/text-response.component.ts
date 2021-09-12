import {
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
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
export class TextResponseComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() text!: string;
  textCtrl: FormControl = new FormControl('');
  textSub!: Subscription;
  selectParameter: boolean = false;
  paramSelected: iParamSelected = {value:''};
  @ViewChild('dialgbox') mensajeInput!: ElementRef;
  @Output() onTextEvent: EventEmitter<string> = new EventEmitter();

  constructor () {
    this.textSub = this.textCtrl.valueChanges.pipe(
      map( value => {
        if ( value.endsWith( '$' ) ) this.selectParameter = true;
        return value
      } ),
      debounceTime( 1000 ),
      distinctUntilChanged(),
    ).subscribe( ( value: string ) => {
      console.log( value )
      value = value.split('\n').join('\\');
      this.onTextEvent.emit(value)
    })
  }

  ngOnInit() {
    if ( this.text ) {
      this.text = this.text.split('\\').join('\u000A')
      console.log( this.text )
      this.textCtrl.patchValue( this.text )
    }
  }

  ngAfterViewInit() {
    let splited = this.text.split('$');
    if (splited.length > 1) {
      this.paramSelected.value = splited[1].split(' ')[0];
    }
    // this.listenText();
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
