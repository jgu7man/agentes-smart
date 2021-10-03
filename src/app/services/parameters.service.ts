import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MxAlert, MxCache, MxColor, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { iIntentState, IntentStateModel, iParameter, iPhrasePart, iTrainingPhrase, ParameterModel } from '../models/intent.model';
import { iAgentParameter } from '../models/parameter.model';
import { ContextsService } from './contexts.service';
import { CurrentAgentService } from './current-agent.service';
import { CurrentIntentService } from './current-intent.service';
import { PhraseService, TrainingPhrasesService } from './training-phrases.service';

@Injectable({
  providedIn: 'root'
})
export class ParametersService {

  /**Informa cuando un parámetro fue agregado en las frases de entrenamiento */
  public parameterAdded$: Subject<iParameter> = new Subject();
  /**Informa cuando un parte de frase de entrenamiento fue borrada y contenía algún parámetro */
  public parameterDeleted$: Subject<boolean> = new Subject();
  /**Escucha y actualiza la lista de parámetros del mensaje en curso */
  /**Lista siempre actualizada del Subject list$ */
  // list: iParameter[]
  agentParams: any[] = [];

  public list$: Observable<iParameter[]>


  constructor(
    private _currentIntent: CurrentIntentService,
    private _frases: TrainingPhrasesService,
    private _phrases: PhraseService,
    private _loading: MxLoading,
    private _alerts: MxAlert,
    private _color: MxColor,
    private _afs: AngularFirestore,
    private _cache: MxCache,
    private _currentAgent: CurrentAgentService,
    private _contexts: ContextsService
  ) {
    this.list$ = this.listen$()
  }

  projectPath(functionName?: string): string {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'userId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, `responses.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `responses.service#${functionName}` )
    } else {
      return `usuarios/${clientId}/agentes/${ projectId }`
    }
  }


  listen$(): Observable<iParameter[]> {
    return this._currentIntent.state$.pipe(
      map(state =>  state ? state.intent.parameters : [])
    )
  }

  async getList(): Promise<iParameter[]> {
    return this.list$.pipe( take( 1 ) ).toPromise()
  }


  // CREATE Parametros
  async add( param: iParameter, entityType?: string ) {
    const path = `${ this.projectPath( 'add' ) }/params`
    const intentState = this._currentIntent.state$.value
    const contextList = await this._contexts.listen$().pipe(take( 1 )).toPromise()
    const context = entityType?.startsWith( '@' )
      ? entityType.substring( 1 )
      : entityType
    const color = contextList.find( c => c.name == context )?.color
    const brightColor = color?.split( ',' ).map( (prop, i) => {
      if ( i === 0 ) return prop
      else if ( i === 1 ) return '60%'
      else return '90%'
    } ).join( ',' );
    console.log( {brightColor} )

    if ( intentState ) {
      const parameters = intentState.intent.parameters || []
      const paramInList = parameters.find(
        (p) => p.displayName == param.displayName
      );

      if (!paramInList) {
        await this._afs.collection( path )
          .doc<iAgentParameter>( param.displayName ).set(
          {
            displayName: param.displayName,
            color: brightColor!,
          },
          { merge: true }
        );
        parameters.push(param);
      }

      this._currentIntent.change('parameters', parameters)

      // console.log(param);
      return;
    }


  }

  // READ PARAM
  async getByName( displayName: string ) {
    const list = await this.getList()
    return list.find(
      (p) => p.displayName === displayName
    );
  }


  getAgentParams() {
    const path = `${ this.projectPath( 'getFirestoreParams' ) }/params`
    return this._afs.collection<iAgentParameter>(path).valueChanges()
  }

  getColor( displayName: string | boolean ): string {
    const agentParams = this._currentAgent.params$.value

    let param = agentParams.find(
      (p) => p.displayName == displayName
    );
    return param ? param.color : '#ffee588c';
  }

  // UPDATE Mensaje Parametro

  async update(param: iParameter) {
    var intentState = this._currentIntent.state$.value

    try {
      if ( intentState ) {
        const parameters = intentState.intent.parameters
        var paramIndex = parameters.findIndex(
          (parameter) => parameter.name == param.name
        );

        parameters[ paramIndex ] = param;
        console.log( 'params defined' );
        this._currentIntent.change('parameters', parameters)
      }
    } catch (error) {
      console.error(error);
      this._alerts.error(`No se pudo actualizar el parámetro del intent ${intentState?.intent.displayName}`, error);
    }
  }

  // DELETE parameter

  async delete(param: iParameter) {
    const intentState = this._currentIntent.state$.value
    try {
      if ( intentState ) {
        const parameters = intentState.intent.parameters
        const trainingPhrases = intentState.intent.trainingPhrases
        parameters.splice(parameters.findIndex(
          (parameter) => parameter.name == param.name
        ), 1 );

        console.log('params deleted');
        this._currentIntent.change('parameters', parameters)
        await this.deleteParamInParts( param.displayName, trainingPhrases );
        return
      }
    } catch (error) {
      console.error(error);
      this._alerts.error(`No fue posible borrar el parámetro ${param.displayName} del intent ${intentState?.intent.displayName}`, error);
    }
  }

  /**
   * Elimina el parámetro de todas las frases de entrenamiento que lo contengan
   */
  private async deleteParamInParts(
    displayName: string,
    trainingPhrases: iTrainingPhrase[]
  ) {
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

                let partsString = this._phrases.stringifyFullPhrase(frase);
                let partsRestored = this._phrases.createParts(partsString);
                frase.parts = partsRestored;

                await this._frases.update( frase );
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
