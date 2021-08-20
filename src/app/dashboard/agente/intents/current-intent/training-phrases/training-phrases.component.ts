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
import { TrainingPhrasesService } from 'src/app/services/training-phrases.service';
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
  addPhraseInput: boolean = false;
  phraseCtrl: FormControl = new FormControl('');
  newPhrase: string = '';
  phraseParts: iPhrasePart[] = [];
  fraseExpanded?: number;
  // paginatiorLabes: MatPaginatorIntl = new MatPaginatorIntl
  currentPage: any[] = [];
  pageSize: number = 10;
  firstIndex: number = 0;
  lastIndex!: number;
  pageIndex: number = 0;
  listenerParamDeleted!: Subscription;
  frasesSub!: Subscription;
  paramAddedSub!: Subscription;
  frasesList: iTrainingPhrase[] = [];

  @ViewChild('newPhraseInput') newPhraseInput!: ElementRef;
  @ViewChild('accordeon') accordion!: MatAccordion;
  @ViewChildren('frase') frasePanels!: QueryList<MatExpansionPanel>;
  @ViewChildren(PhraseItemComponent)
  prhaseList!: QueryList<PhraseItemComponent>;
  @ViewChildren(PhraseParamsFormComponent)
  parametersList!: QueryList<PhraseParamsFormComponent>;

  constructor(
    private _loading: MxLoading,
    public $frases: TrainingPhrasesService,
    public $mensaje: CurrentIntentService,
    private _params: ParametersService,
    private _paginator: MatPaginatorIntl
  ) {
    this._paginator.itemsPerPageLabel = 'Frases por página';
    this._paginator.firstPageLabel = 'Primera página';
    this._paginator.lastPageLabel = 'Última página';
    this._paginator.nextPageLabel = 'Siguiente';
    this._paginator.previousPageLabel = 'Anterior';
  }

  ngOnInit(): void {
    this.frasesSub = this.$frases.list$.subscribe((frases) => {
      this.frasesList = frases;
      this.lastIndex = this.lastIndex ? this.lastIndex : this.pageSize;

      // console.log( {first: this.firstIndex, last: this.lastIndex} )
      this.currentPage = this.frasesList.slice(this.firstIndex, this.lastIndex);

      this.getLastIndex(this.firstIndex, this.currentPage.length);
    });
  }

  getLastIndex(startIndex: number, length: number) {
    if (this.pageSize > length) {
      this.lastIndex = length + startIndex;
    } else {
      this.lastIndex = startIndex + this.pageSize;
    }
  }

  pageEvent(event: PageEvent) {
    this.firstIndex =
      event.pageIndex == 0 ? 0 : event.pageIndex * this.pageSize;

    let trim = event.pageIndex * this.pageSize + this.pageSize;

    this.currentPage = this.frasesList.slice(this.firstIndex, trim);

    this.getLastIndex(this.firstIndex, this.currentPage.length);
    // console.log(this.currentPage.length, this.firstIndex, this.lastIndex);

    // console.log(this.firstIndex, this.lastIndex);
  }

  ngAfterViewInit() {
    this.paramAddedSub = this.$frases.paramAdded$.subscribe(() => {
      // console.log( 'added' )
      this.accordion.closeAll();
    });
  }

  // get Frases() {
  //   const mensaje = this.$mensaje.current$.getValue();
  //   console.log( mensaje )
  //   return mensaje ? mensaje.trainingPhrases : [];
  // }

  // CREATE frase
  async toAddPhrase() {
    this.addPhraseInput = true;
    await this._loading.waitFor(200);
    this.newPhraseInput.nativeElement.focus();
  }

  async onSetPhrase() {
    this.addPhraseInput = false;
    this.fraseExpanded = undefined;
    if (this.newPhrase) {
      // console.log(this.newPhrase);
      const NEWPHRASE: iTrainingPhrase = {
        type: 'EXAMPLE',
        parts: this.$frases.createParts(this.newPhrase),
      };
      await this._loading.waitFor(200);
      this.$frases.addTraningPhrase(NEWPHRASE).then(async () => {
        // console.log( this.currentPage.length == this.pageSize )
        if (this.currentPage.length == this.pageSize) {
          this.pageIndex = Math.ceil(
            this.frasesList.length / this.pageSize - 1
          );
          this.firstIndex = this.pageIndex * this.pageSize;
          this.lastIndex = this.frasesList.length;
          this.currentPage = this.frasesList.slice(
            this.firstIndex,
            this.lastIndex
          );
        } else {
          this.currentPage.push(NEWPHRASE);
          this.lastIndex++;
        }
        this.newPhrase = '';
        await this._loading.waitFor(500);
        this.accordion.closeAll();
      });
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
        await this.$frases.stractSelectedPart(frase, textSelected);
      // console.log( fraseRestructured);

      this.$frases.updatePhrase(fraseRestructured);
      await this._loading.waitFor(100);
      this.fraseExpanded = index;
    }
  }

  validateFraseExpanded(index: number) {
    if (this.fraseExpanded && this.fraseExpanded >= 0) {
      return index == this.fraseExpanded;
    } else return false;
  }

  openedPanel(event: any) {
    // console.log( event )
  }

  onRemoveFrase(index: number) {
    this.currentPage.splice(index, 1);
  }

  disableFrase(frase: iTrainingPhrase) {
    let someEntity: boolean = false;
    frase.parts.forEach((parte) => {
      if (parte && (parte.entityType || parte.alias)) someEntity = true;
    });
    return someEntity ? false : true;
  }

  trackByFraseName(index: number, frase: iTrainingPhrase) {
    return frase.name;
  }

  ngOnDestroy() {
    // this.listenerParamDeleted.unsubscribe()
    this.paramAddedSub.unsubscribe();
    this.frasesSub.unsubscribe();
  }
}
