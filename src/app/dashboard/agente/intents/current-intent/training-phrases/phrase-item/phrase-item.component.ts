import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MxLoading } from '@marxa/devkit';
import { iTrainingPhrase } from 'src/app/models/intent.model';
import { ParametersService } from 'src/app/services/parameters.service';
import { TrainingPhrasesService } from 'src/app/services/training-phrases.service';

@Component({
  selector: 'as-phrase-item',
  templateUrl: './phrase-item.component.html',
  styleUrls: ['./phrase-item.component.scss']
})
export class PhraseItemComponent implements OnInit {

  @Input() switchPhraseInput: boolean = false
  @Input() frase!: iTrainingPhrase
  @Input() index!: number
  @ViewChild( 'inputPhrase' ) inputPhrase!: ElementRef
  phraseToEdit: string = ''

  @Output() onDeleted = new EventEmitter<boolean>()

  constructor (
    private _loading: MxLoading,
    private _frases: TrainingPhrasesService,
    public params_: ParametersService
  ) { }

  ngOnInit(): void {
  }

  preventOnClick(event: any) {
      event.preventDefault()
      event.stopImmediatePropagation()
  }

  @Input() async toEditPhrase( phrase: iTrainingPhrase ) {
    this.switchPhraseInput = true
    console.log( phrase );
    this.phraseToEdit = await this._frases.stringifyFullPhrase( phrase )
    await this._loading.waitFor( 100 )
    this.inputPhrase.nativeElement.focus()
  }



  onSetPhrase( PHRASE: iTrainingPhrase ) {

    this.switchPhraseInput = false
    console.log( this._frases.stringifyFullPhrase( PHRASE ), '|', this.phraseToEdit );

    if ( this._frases.stringifyFullPhrase( PHRASE ) === this.phraseToEdit ) {
      console.log( 'no edicion' );
    } else {
      console.log( 'editada' );
      console.log( PHRASE );

      PHRASE.parts = this._frases.createParts( this.phraseToEdit )

      console.log( PHRASE );
      this._frases.updatePhrase( PHRASE,  )

    }

  }





  onSelectPart( textSelected: string ) {
    try {

    } catch (error) {

    }
  }

  delItem() {
    this._frases.deletePhrase( this.frase ).then( () => {
      this.onDeleted.emit(true)
    })
  }
}
