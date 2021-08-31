import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'as-phrase-input',
  templateUrl: './phrase-input.component.html',
  styleUrls: ['./phrase-input.component.scss']
})
export class PhraseInputComponent implements OnInit {

  public phraseCtrl: FormControl = new FormControl( '' );
  @Input() phrase?: string
  @Output() onBlur: EventEmitter<void> = new EventEmitter();
  @Output() onSubmit: EventEmitter<string> = new EventEmitter()

  constructor() { }

  ngOnInit(): void {
    if ( this.phrase ) {
      this.phraseCtrl.patchValue(this.phrase)
    }
  }

}
