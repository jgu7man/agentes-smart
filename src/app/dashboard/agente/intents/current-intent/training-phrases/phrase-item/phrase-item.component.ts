import { OnDestroy } from '@angular/core';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MxLoading } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { iTrainingPhrase } from 'src/app/models/intent.model';
import { iAgentParameter } from 'src/app/models/parameter.model';
import { ParametersService } from 'src/app/services/parameters.service';
import { PhraseService, TrainingPhrasesService } from 'src/app/services/training-phrases.service';

@Component({
  selector: 'as-phrase-item',
  templateUrl: './phrase-item.component.html',
  styleUrls: ['./phrase-item.component.scss']
})
export class PhraseItemComponent implements OnInit, OnDestroy {

  @Input() switchPhraseInput: boolean = false
  @Input() phrase!: iTrainingPhrase
  @Input() index!: number
  @ViewChild( 'inputPhrase' ) inputPhrase!: ElementRef
  phraseToEdit: string = ''

  @Output() onDeleted = new EventEmitter<boolean>()
  agentParams: iAgentParameter[] = []
  private agentParamsSubs: Subscription

  constructor (
    private _loading: MxLoading,
    private _frases: TrainingPhrasesService,
    public params_: ParametersService,
    private _phrases: PhraseService
  ) {
    this.agentParamsSubs = this.params_.getAgentParams()
      .subscribe( params => this.agentParams = params)
   }

  ngOnInit(): void {
  }

  preventOnClick(event: any) {
      event.preventDefault()
      event.stopImmediatePropagation()
  }

  async toEditPhrase( phrase: iTrainingPhrase ) {
    this.switchPhraseInput = true
    console.log( phrase );
    this.phraseToEdit = await this._phrases.stringifyFullPhrase( phrase )
    await this._loading.waitFor( 100 )
    this.inputPhrase.nativeElement.focus()
  }

  getColor(displayName: string | boolean) {
    let param = this.agentParams.find(
      (p) => p.displayName == displayName
    )
    return param ? param.color : '#ffee588c';
  }

  onSetPhrase( phrase: string ) {

    this.switchPhraseInput = false
    console.log( this._phrases.stringifyFullPhrase( this.phrase ), '|', phrase );

    if ( this._phrases.stringifyFullPhrase( this.phrase ) !==  phrase) {
      this.phrase.parts = this._phrases.createParts( phrase )
      this._frases.update( this.phrase )
    }
  }


  delItem() {
    this._frases.delete( this.phrase ).then( () => {
      this.onDeleted.emit(true)
    })
  }

  ngOnDestroy() {
    this.agentParamsSubs.unsubscribe()
  }
}
