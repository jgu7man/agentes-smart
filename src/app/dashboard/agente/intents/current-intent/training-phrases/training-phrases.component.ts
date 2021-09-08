import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MxLoading } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { iPhrasePart, iTrainingPhrase } from 'src/app/models/intent.model';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { ParametersService } from 'src/app/services/parameters.service';
import { PhraseService, TrainingPhrasesIndex, TrainingPhrasesService } from 'src/app/services/training-phrases.service';
import { PhraseItemComponent } from './phrase-item/phrase-item.component';
import { PhraseParamsFormComponent } from './phrase-params-form/phrase-params-form.component';

@Component({
  selector: 'as-training-phrases',
  templateUrl: './training-phrases.component.html',
  styleUrls: ['./training-phrases.component.scss'],
})
export class TrainingPhrasesComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public addPhraseInput: boolean = false;
  public phraseCtrl: FormControl = new FormControl('');
  private phraseExpanded?: number;

  private phrasesSub!: Subscription;
  private paramAddedSub!: Subscription;
  phrasesList: iTrainingPhrase[] = [];

  @ViewChild('newPhraseInput') newPhraseInput!: ElementRef;
  @ViewChild('accordeon') accordion!: MatAccordion;

  constructor(
    private _loading: MxLoading,
    public $trainingPhrases: TrainingPhrasesService,
    private _phrases: PhraseService,
    public phrasesIndex: TrainingPhrasesIndex,
    private _paginator: MatPaginatorIntl,
  ) {
    this._paginator.itemsPerPageLabel = 'Frases por página';
    this._paginator.firstPageLabel = 'Primera página';
    this._paginator.lastPageLabel = 'Última página';
    this._paginator.nextPageLabel = 'Siguiente';
    this._paginator.previousPageLabel = 'Anterior';
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.paramAddedSub = this.$trainingPhrases
      .paramAdded$.subscribe( () => {
      this.accordion.closeAll();
    });
  }

  // CREATE frase
  async toAddPhrase() {
    this.addPhraseInput = true;
  }



  async onSetPhrase(phrase: string) {
    this.addPhraseInput = false;
    this.phraseExpanded = undefined;

    if ( phrase ) {
      // console.log(newPhrase);
      const trainingPhrase: iTrainingPhrase = {
        type: 'EXAMPLE',
        parts: this._phrases.createParts(phrase),
      };

      await this._loading.waitFor(200);
      await this.$trainingPhrases.add(trainingPhrase)

      this.phraseCtrl.patchValue('')
      await this._loading.waitFor(500);
      this.accordion.closeAll();
    }
  }


  // UPDATE FRASE

  /** Obtiene el valor seleccionado al momento de soltar el mouse en la frase de entrenamiento y la transforma en "partes" */
  async onSelect(frase: iTrainingPhrase, index: number) {
    const textSelected = window.getSelection()?.toString() || '';
    if (textSelected) {
      // Define variables
      //   console.log(textSelected, frase);
      var fraseRestructured: iTrainingPhrase =
        // Find the part that includes text selected and split it
        await this._phrases.stractSelectedPart(frase, textSelected);
      // console.log( fraseRestructured);

      this.$trainingPhrases.update(fraseRestructured);
      await this._loading.waitFor(100);
      this.phraseExpanded = index;
    }
  }

  validateFraseExpanded(index: number) {
    if (this.phraseExpanded && this.phraseExpanded >= 0) {
      return index == this.phraseExpanded;
    } else return false;
  }



  disableFrase(frase: iTrainingPhrase): boolean {
    let someEntity: boolean = false;
    frase.parts.forEach((parte) => {
      if (parte && (parte.entityType || parte.alias)) someEntity = true;
    });
    return someEntity ? false : true;
  }

  ngOnDestroy() {
    // this.listenerParamDeleted.unsubscribe()
    this.paramAddedSub.unsubscribe();
    // this.phrasesSub.unsubscribe();
  }
}
