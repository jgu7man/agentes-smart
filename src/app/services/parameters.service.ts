import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MxAlert, MxCache, MxColor, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { Subject } from 'rxjs';
import { IntentStateModel, iParameter, iPhrasePart, iTrainingPhrase, ParameterModel } from '../models/intent.model';
import { CurrentIntentService } from './current-intent.service';
import { TrainingPhrasesService } from './training-phrases.service';

@Injectable({
  providedIn: 'root'
})
export class ParametersService {

  /**Informa cuando un parámetro fue agregado en las frases de entrenamiento */
  public parameterAdded$: Subject<iParameter> = new Subject();
  /**Informa cuando un parte de frase de entrenamiento fue borrada y contenía algún parámetro */
  public parameterDeleted$: Subject<boolean> = new Subject();
  /**Escucha y actualiza la lista de parámetros del mensaje en curso */
  list$: Subject<iParameter[]> = new Subject();
  /**Lista siempre actualizada del Subject list$ */
  // list: iParameter[]
  firestoredParams: any[] = [];

  constructor(
    private _mensaje: CurrentIntentService,
    private _frases: TrainingPhrasesService,
    private _loading: MxLoading,
    private _alerts: MxAlert,
    private _color: MxColor,
    private _afs: AngularFirestore,
    private _cache: MxCache,
  ) {
    this.getFirestoredParams();
  }

  projectPath(functionName?: string): string {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'userId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, `itents.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `itents.service#${functionName}` )
    } else {
      return `usuarios/${clientId}/agentes/${ projectId }`
    }
  }



  // CREATE Parametros
  async addParam( param: iParameter, example?: string ) {
    var intent = this._mensaje.current$.value.intent;
    const path = `${this.projectPath('add')}/parameters`
    var paramInList = intent.parameters.find(
      (p) => p.displayName == param.displayName
    );

    if (!paramInList) {
      await this._afs.collection(path).doc(param.displayName).set(
        {
          displayName: param.displayName,
          color: this._color.generateBrightColor(),
        },
        { merge: true }
      );
    }

    if (!intent.parameters || intent.parameters.length == 0) {
      intent.parameters = [param];
      // console.log('params defined');
      // console.log(parameters);
      // this.parameterAdded$.next(param);
    } else {
      intent.parameters.push(param);
      // console.log('params defined');
      // this.parameterAdded$.next(param);
    }
    this._mensaje.current$.next({
      ...this._mensaje.current$.value,
      intent: { ...intent, parameters: intent.parameters },
      unsaved: true
    });

    // console.log(param);
    return;
  }

  // READ PARAM
  getParamByName( displayName: string ) {
    var intent = this._mensaje.current$.value.intent
    return intent.parameters.find(
      (p) => p.displayName === displayName
    );
  }


  async getFirestoredParams() {
    const path = `${ this.projectPath( 'getFirestoreParams')}/parameters`
    this._afs.collection<iParameter>(path).valueChanges()
      .subscribe(async (list) => {
        this.firestoredParams = list
      });
  }

  getParamColor(displayName: string | boolean): string {
    if (typeof displayName == 'string') {
      if (this.firestoredParams.length > 0) {
        let param = this.firestoredParams.find(
          (p) => p.displayName == displayName
        );
        return param ? param['color'] : '#ffee588c';
      } else {
        return '#ffee588c';
      }
    } else return '#ffee588c'
  }

  // UPDATE Mensaje Parametro

  async updateParam(param: iParameter) {
    var intent = this._mensaje.current$.getValue().intent;

    try {
      var paramIndex = intent.parameters.findIndex(
        (parameter) => parameter.name == param.name
      );
      intent.parameters[paramIndex] = param;
      console.log('params defined');
      this._mensaje.current$.next({
        ...this._mensaje.current$.getValue(),
        intent: { ...intent, parameters: intent.parameters },
        unsaved: true
      })
    } catch (error) {
      console.error(error);
      this._alerts.error(`No se pudo actualizar el parámetro del intent ${intent.displayName}`, error);
    }
  }

  // DELETE parameter

  async deleteParam(param: iParameter) {
    const intent = this._mensaje.current$.getValue().intent;
    try {
      intent.parameters.splice(intent.parameters.findIndex(
        (parameter) => parameter.name == param.name
      ), 1);
      console.log('params deleted');
      this._mensaje.current$.next({
        ...this._mensaje.current$.getValue(),
        intent: { ...intent, parameters: intent.parameters },
        unsaved: true
      })
      await this.deleteParamInParts( param.displayName );
      return
    } catch (error) {
      console.error(error);
      this._alerts.error(`No fue posible borrar el parámetro ${param.displayName} del intent ${intent.displayName}`, error);
    }
  }

  /**
   * Elimina el parámetro de todas las frases de entrenamiento que lo contengan
   */
  private async deleteParamInParts(displayName: string) {
    const trainingPhrases = this._mensaje.current$.value.intent.trainingPhrases;
    // displayName = displayName.split('@')[1]
    await this._loading.asyncForEach(
      trainingPhrases,
      async (frase: iTrainingPhrase, index) => {
        // Busca en las partes donde hay el parámetro eliminado
        return await this._loading.asyncForEach(
          frase.parts, async (parte: iPhrasePart, parteIndex: number) => {
            if (parte.alias) {
              if ( parte.alias == displayName ) {
                delete frase.parts[parteIndex].entityType;
                delete frase.parts[parteIndex].alias;

                let partsString = this._frases.stringifyFullPhrase(frase);
                let partsRestored = this._frases.createParts(partsString);
                frase.parts = partsRestored;

                await this._frases.updatePhrase( frase );
              }
            }
            return
          }
        );
      }
    );

    this.parameterDeleted$.next(true);

    return;
  }
}
