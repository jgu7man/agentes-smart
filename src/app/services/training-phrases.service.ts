import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading, MxText } from '@marxa/devkit';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { combineAll, filter, map, mergeAll, mergeMap, pluck, take } from 'rxjs/operators';
import { iIntentState, iPhrasePart, iTrainingPhrase } from '../models/intent.model';
import { iPhrasePartMap } from '../models/training-phrase.model';
import { CurrentIntentService } from './current-intent.service';

@Injectable({ providedIn: 'root' })
export class TrainingPhrasesService {

  paramAdded$: Subject<any> = new Subject();
  partSelected!: iPhrasePartMap
  public list$: Observable<iTrainingPhrase[]>
  constructor(
    private _currentIntent: CurrentIntentService,
    private _loading: MxLoading,
    private _alert: MxAlert,
  ) {
    this.list$ = this.listen$()
  }

  listen$(): Observable<iTrainingPhrase[]> {
    return this._currentIntent.state$.pipe(
      map( state => state ? state.intent.trainingPhrases : [])
    )
  }

  get list() {
    return this.list$.pipe( take( 1 ) ).toPromise()
  }

  // CREATE Frses de entrenamiento
  async add(trainingPhrase: iTrainingPhrase, index?: number) {
    try {
      const intentState = this._currentIntent.state$.value

      if ( intentState ) {
        const trainingPhrases = intentState.intent.trainingPhrases
        index
          ? trainingPhrases.splice(index, 0, trainingPhrase)
          : trainingPhrases.push(trainingPhrase);

        this._currentIntent.change('trainingPhrases', trainingPhrases)
      }
      // this.store.dispatch(actions.setUnsaved());

      return;
    } catch ( error ) {
      console.error(error);
      throw new MxErrorAlertModel(`Error agregando frase de entrenamiento`, error);
    }
  }

  // UPDATE
  async update(phrase: iTrainingPhrase) {
    const index = await this.findIndex(phrase)
    try {
      const intentState = this._currentIntent.state$.value
      if ( intentState ) {
        const trainingPhrases = intentState.intent.trainingPhrases
        trainingPhrases[ index ] = phrase;
        this._currentIntent.change( 'trainingPhrases', trainingPhrases)
      }

    } catch (error) {
      console.error(error);
      this._alert.error('Error actualizando la frase de entrenamiento', error);
    }
  }





  async findIndex(frase: iTrainingPhrase) {
    const frasesList = await this.list
    var fraseIndex: number
    if (frase.name) {
      fraseIndex = frasesList.findIndex(f => f.name === frase.name)
    } else {
      fraseIndex = frasesList.findIndex(fList =>
        fList.parts[0].text  === frase.parts[0].text
      )
    }
    // console.log( fraseIndex )

    return fraseIndex
  }

  // DELETE
  async delete(frase: iTrainingPhrase) {
    try {
      const intentState = this._currentIntent.state$.value;
      if ( intentState ) {
        const trainingPhrases = intentState.intent.trainingPhrases
        trainingPhrases.splice(
          trainingPhrases.findIndex(
          (phrase) => phrase.name === frase.name
        ), 1);

        this._currentIntent.change('trainingPhrases', trainingPhrases)
      }
    } catch (error) {
      console.error(error);
      this._alert.error('No se pudo eliminar la frase de entrenamiento', error);
    }
  }
}




@Injectable( { providedIn: 'root' } )
export class TrainingPhrasesIndex {

  public firstIndex: number = 0;
  public lastIndex: number = 0;
  public page: number = 0;
  public length: number = 0;
  private pageTrim$ = new BehaviorSubject<{ first: number; last: number }>(
    {first: 0, last: 10}
  )

  constructor (
    private _trainingPhrases: TrainingPhrasesService
  ) {}


  get currentPage$() {
    return combineLatest([
      this._trainingPhrases.list$,
      this.pageTrim$
    ]).pipe(
      map( ( [ list, trim ] ) => {
        this.length = list.length
        this.firstIndex = trim.first
        let page = list.slice( trim.first, trim.last );
        this.lastIndex = this.firstIndex + ( page.length < 10 ? page.length : 10 );
        return list
      })
    )
  }

  onPageEvent( event: PageEvent ) {
    this.page = event.pageIndex;
    this.pageTrim$.next( {
      first: this.page == 0 ? 0 : this.page * 10,
      last: (this.page * 10) + 10
    })
  }


}


@Injectable( { providedIn: 'root' } )
export class PhraseService {

  constructor (
    private _loading: MxLoading,
    private _alert: MxAlert
  ) {}

  /**
   * Retorna la frase completa con acotaciones para definir entidades y parámetros.
   * `;text;`: [texto entre dos punto y coma] parte seleccionada
   * `~` = divide la entidad del parámetro con su valor
   * `=` = divide el parámetro de su valor
   * @example "text ;entityTypeDisplayName=paramValue; text"
   */
   stringifyFullPhrase(phrase: iTrainingPhrase): string {
    let partsString: string[] = [];
    phrase.parts.forEach((part) => {
      if (part) {
        if (!part.alias) part.alias = '';
        partsString.push(
          part.entityType
            ? `;${part.entityType}~${part.alias}=${part.text};`
            : part.text
        );
      }
    });
    return partsString.join('');
  }

  /** Retorna la frase completa en un string sin acotaciones */
  stringifyCleanPhrase(phrase: iTrainingPhrase): string {
    let partsString: string[] = [];
    phrase.parts.forEach((part) => {
      partsString.push(part.text);
    });
    return partsString.join('');
  }

  /** * Retornas las partes de una frase que no tienen entidad o no están seleccionadas en un string limpio */
  stringifyUnselectParts(phrase: iTrainingPhrase): string {
    let partialString: string[] = [];
    phrase.parts.forEach((part) => {
      if (!part.alias) {
        partialString.push(part.text);
      }
    });
    return partialString.join('');
  }

  /** Returns a part of a string with the manual format. */
  createParts(frase: string): iPhrasePart[] {
    const fraseInParts = frase.split(';');
    var partes: iPhrasePart[] = [];

    // console.log(fraseInParts);

    if (fraseInParts.length > 1) {
      fraseInParts.forEach((part) => {
        if (part) {
          let partSplited = part.split('~');
          if (partSplited.length > 1) {
            let param = partSplited[1].split('=');
            // REVIEW La entity sumaba @ cada vez que era editado o agragado, se generó una solución
            let entity = !partSplited[0].includes('@')
              ? `@${partSplited[0]}`
              : partSplited[0];
            partes.push({
              entityType: entity ? entity : '',
              text: param.length > 1 ? param[1] : param[0],
              alias: param.length > 1 ? param[0] : '',
              userDefined: true
            });
          } else if (partSplited) {
            partes.push({
              text: partSplited[0],
              entityType: '',
              alias: '',
              userDefined: false
            });
          }
        }
      });
    } else {
      partes.push({
        text: frase,
      });
    }

    // console.log(partes);

    return partes;
  }

  /** Returns parts after find the part that includes the text selected and split it */
  async stractSelectedPart(
    frase: iTrainingPhrase,
    textSelected: string
  ): Promise<iTrainingPhrase> {
    try {
      var partSelected: iPhrasePartMap = {index:0, part: {text: ''} }

      // * Convertimos las partes en map para conservar el orden
      let initialParts: Map<number, iPhrasePart> = new Map();
      frase.parts.forEach((parte, i) => {
        initialParts.set(i, parte);
      });
      // console.log(initialParts);

      // * Buscamos en las partes, el texto seleccionado
      initialParts.forEach((part, index) => {
        if (part.text.includes(textSelected)) {
          partSelected = {index, part};
        }
      });
      // console.log(partSelected);

      if (partSelected) {
        // * Dividimos la parte encontrada en nuevas partes
        let newParts: Map<number, iPhrasePart> = await this.getTextSelectInPart(
          partSelected.part.text,
          textSelected
        );
        // console.log(newParts);

        // * Sustituimos la parte eliminada
        let resultParts: Map<number, iPhrasePart> = new Map();
        initialParts.forEach((p, i) => {
          if (i < partSelected?.index) {
            // console.log('before part selected ',i);
            resultParts.set(i, p);
          } else if (i == partSelected?.index) {
            // console.log( partSelected[0] )
            // Define nuevos valores para las nuevas partes donde la parte seleccionada se sustituye por el nuevo mapa, basado en el index de la parte seleccionada y sumando el index de la parte nueva. Así si la parte seleccionada es 1 la primera nueva parte será 1+0=1, y sus consecuententes 1+1=2; 1+2=3...
            // console.log(newParts)
            if (newParts.size > 1) {
              newParts.forEach((nP, nI) => {
                // console.log(nP, nI)
                // console.log( 'on part selected ', partSelected[ 0 ] + nI );
                resultParts.set(partSelected.index + nI, nP);
              });
            } else {
              let part = newParts.get( 1 )
              if (part) resultParts.set(partSelected.index, part);
            }
          } else {
            // Continua con la asignación de orden a partir de la longitud de la propiedad asignando uno a uno como el último
            // console.log( 'after part selected ', resultParts.size);
            resultParts.set(resultParts.size, p);
          }
        });
        // console.log(resultParts);
        frase.parts = [];
        if (!resultParts.get(0)) {
          resultParts.forEach((parte) => {
            frase.parts.push(parte);
          });
        } else {
          await this._loading.asyncForEach(resultParts, (parte) => {
            // console.log( parte )
            frase.parts.push(parte);
          });
        }
      }

      // console.log(frase);
      return frase;
    } catch (error) {
      this._alert.message(
        'No se encontró el texto que seleccionaste. Intenta borrar la selección previa e intenta de nuevo'
      );
      throw console.error(error);
    }
  }

  /** Returna un nuevo mapa de partes de frase de entrenamiento, separando un texto seleccionado */
  public async getTextSelectInPart(
    textOnSearch: string,
    textSelected: string
  ): Promise<Map<number, iPhrasePart>> {
    var parts: Map<number, iPhrasePart> = new Map();
    var textReplaced: string,
      partInParts: string[] = [];

    textReplaced = textOnSearch.replace(textSelected, `:${textSelected}:`);
    partInParts = textReplaced.split(':');

    partInParts.forEach((textPart, i) => {
      if (textPart) {
        let newPart: iPhrasePart = {
          text: textPart,
        };

        if (textPart == textSelected) newPart.alias = true;
        parts.set(i, newPart);
      }
    });

    return parts;
  }
}
