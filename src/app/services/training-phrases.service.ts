import { Injectable } from '@angular/core';
import { MxAlert, MxErrorAlertModel, MxLoading, MxText } from '@marxa/devkit';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { iPhrasePart, iTrainingPhrase } from '../models/intent.model';
import { CurrentIntentService } from './current-intent.service';

@Injectable({
  providedIn: 'root'
})
export class TrainingPhrasesService {

  list$ = new BehaviorSubject<iTrainingPhrase[]>([]);
  paramAdded$: Subject<any> = new Subject();
  partSelected!: iPhrasePartMap
  constructor(
    // private fs: AngularFirestore,
    private _mensaje: CurrentIntentService,
    private _loading: MxLoading,
    private _alert: MxAlert,
  ) {
    this._mensaje.current$.pipe(
      pluck('intent', 'trainingPhrases'),
    ).subscribe(this.list$)
  }


  // CREATE Frses de entrenamiento
  async addTraningPhrase(frase: iTrainingPhrase, index?: number) {
    try {
      const intent = this._mensaje.current$.value.intent

      index
        ? intent.trainingPhrases.splice(index, 0, frase)
        : intent.trainingPhrases.push(frase);

      this._mensaje.current$.next({
        ...this._mensaje.current$.value,
        intent: { ...intent, trainingPhrases: intent.trainingPhrases },
        unsaved: true
      });
      // this.store.dispatch(actions.setUnsaved());

      return;
    } catch ( error ) {
      console.error(error);
      throw new MxErrorAlertModel(`Error agregando frase de entrenamiento`, error);
    }
  }

  // UPDATE
  async updatePhrase(phrase: iTrainingPhrase) {
    const index = this.findFraseIndex(phrase)
    // console.log( index )
    try {
      const intent = this._mensaje.current$.getValue().intent;
      intent.trainingPhrases[index] = phrase;

      this._mensaje.current$.next({
        ...this._mensaje.current$.getValue(),
        intent: { ...intent, trainingPhrases: intent.trainingPhrases },
        unsaved: true
      })
    } catch (error) {
      console.error(error);
      this._alert.error('Error actualizando la frase de entrenamiento', error);
    }
  }

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
  stringCleanPhrase(phrase: iTrainingPhrase): string {
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
      // * Convertimos las partes en map para conservar el orden
      let initialParts: Map<number, iPhrasePart> = new Map();
      frase.parts.forEach((parte, i) => {
        initialParts.set(i, parte);
      });
      // console.log(initialParts);

      // * Buscamos en las partes, el texto seleccionado
      initialParts.forEach((part, index) => {
        if (part.text.includes(textSelected)) {
          this.partSelected = {index, part};
        }
      });
      // console.log(partSelected);

      if (this.partSelected) {
        // * Dividimos la parte encontrada en nuevas partes
        let newParts: Map<number, iPhrasePart> = await this.getTextSelectInPart(
          this.partSelected.part.text,
          textSelected
        );
        // console.log(newParts);

        // * Sustituimos la parte eliminada
        let resultParts: Map<number, iPhrasePart> = new Map();
        initialParts.forEach((p, i) => {
          if (i < this.partSelected?.index) {
            // console.log('before part selected ',i);
            resultParts.set(i, p);
          } else if (i == this.partSelected?.index) {
            // console.log( partSelected[0] )
            // Define nuevos valores para las nuevas partes donde la parte seleccionada se sustituye por el nuevo mapa, basado en el index de la parte seleccionada y sumando el index de la parte nueva. Así si la parte seleccionada es 1 la primera nueva parte será 1+0=1, y sus consecuententes 1+1=2; 1+2=3...
            // console.log(newParts)
            if (newParts.size > 1) {
              newParts.forEach((nP, nI) => {
                // console.log(nP, nI)
                // console.log( 'on part selected ', partSelected[ 0 ] + nI );
                resultParts.set(this.partSelected.index + nI, nP);
              });
            } else {
              let part = newParts.get( 1 )
              if (part) resultParts.set(this.partSelected.index, part);
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


  findFraseIndex(frase: iTrainingPhrase) {
    const frasesList = this.list$.getValue()
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
  async deletePhrase(frase: iTrainingPhrase) {
    try {
      const intent = this._mensaje.current$.value.intent;
      intent.trainingPhrases.splice(
        intent.trainingPhrases.findIndex(
        (phrase) => phrase.name === frase.name
      ), 1);

      this._mensaje.current$.next({
        ...this._mensaje.current$.value,
        intent: { ...intent, trainingPhrases: intent.trainingPhrases },
        unsaved: true
      })
    } catch (error) {
      console.error(error);
      this._alert.error('No se pudo eliminar la frase de entrenamiento', error);
    }
  }
}

export interface iPhrasePartMap {
  index: number;
  part: iPhrasePart
}
