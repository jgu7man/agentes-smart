import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { iPhrasePart, iTrainingPhrase } from 'src/app/models/intent.model';
import { TrainingPhrasesService } from 'src/app/services/training-phrases.service';

@Component({
  selector: 'as-phrase-params-form',
  templateUrl: './phrase-params-form.component.html',
  styleUrls: ['./phrase-params-form.component.scss']
})
export class PhraseParamsFormComponent implements OnInit {

  @Input() frase!: iTrainingPhrase
  @Input() fraseIndex!: number
  @Output() tipoSelected = new EventEmitter<iPhrasePart>()
  tipos: string[] = []


  constructor (

    private _frase: TrainingPhrasesService
  ) { }

  ngOnInit() {
  }


  setTipoFrase( phrasePart: any, partIndex: number ) {
    let part = phrasePart as iPhrasePart
      this.frase.parts[ partIndex ] = part
      this._frase.updatePhrase( this.frase )
  }

  onParamAdded(parte: iPhrasePart, index: number) {
    this.frase.parts[index] = parte
    this._frase.updatePhrase(this.frase)
  }


  onDelPartParam( index: number ) {
    delete this.frase.parts[ index ].entityType
    delete this.frase.parts[ index ].alias
    // console.log( this.frase.parts );
    var restoredPartText = this._frase.stringifyFullPhrase( this.frase )
    this.frase.parts = this._frase.createParts( restoredPartText )
    // console.log(this.frase);
    this._frase.updatePhrase(this.frase )
    // var newParts = this._frase.createParts( restoredPartText )
    // console.log(newParts);

  }



}
