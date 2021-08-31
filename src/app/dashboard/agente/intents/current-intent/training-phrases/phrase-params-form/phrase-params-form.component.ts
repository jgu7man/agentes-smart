import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { iPhrasePart, iTrainingPhrase } from 'src/app/models/intent.model';
import { PhraseService, TrainingPhrasesService } from 'src/app/services/training-phrases.service';

@Component({
  selector: 'as-phrase-params-form',
  templateUrl: './phrase-params-form.component.html',
  styleUrls: ['./phrase-params-form.component.scss']
})
export class PhraseParamsFormComponent implements OnInit {

  @Input() phrase!: iTrainingPhrase
  // @Input() fraseIndex!: number
  @Output() tipoSelected = new EventEmitter<iPhrasePart>()
  tipos: string[] = []


  constructor (
    private _phrases: PhraseService,
    private _frase: TrainingPhrasesService
  ) { }

  ngOnInit() {
  }


  setTipoFrase( phrasePart: any, partIndex: number ) {
    let part = phrasePart as iPhrasePart
      this.phrase.parts[ partIndex ] = part
      this._frase.update( this.phrase )
  }

  onParamAdded(parte: iPhrasePart, index: number) {
    this.phrase.parts[index] = parte
    this._frase.update(this.phrase)
  }


  onDelPartParam( index: number ) {
    delete this.phrase.parts[ index ].entityType
    delete this.phrase.parts[ index ].alias
    // console.log( this.frase.parts );
    var restoredPartText = this._phrases.stringifyFullPhrase( this.phrase )
    this.phrase.parts = this._phrases.createParts( restoredPartText )
    // console.log(this.frase);
    this._frase.update(this.phrase )
    // var newParts = this._frase.createParts( restoredPartText )
    // console.log(newParts);

  }



}
