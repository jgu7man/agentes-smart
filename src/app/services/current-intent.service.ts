import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject, Subscription, forkJoin, Observable, BehaviorSubject, of } from 'rxjs';
import { map, pluck, tap, debounceTime, flatMap, filter, take, catchError, mergeMap } from 'rxjs/operators';
import { emptyIntent, iDialogflowIntent, iIntentState, IntentStateModel, iParameter } from '../models/intent.model';
import { MxAlert, MxCache, MxCommonsService, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { DialogflowIntentsService, IntentsService } from './intents.service';
import { RespuestaModel } from '../models/intent-response.model';
import { SystemEntitiesService } from '../admin/utils/system-entities.service';
import { EntityTypeModel, iSystemEntity } from '../models/entity-type.model';
import { environment } from 'src/environments/environment';
import { EntityTypesService } from './entitiy-types.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentIntentService {
  /** Informa cuando el intent actual ha cambiado */
  public state$ = new BehaviorSubject<IntentStateModel | null>(null);
  /** Contiene el intent actual y sus cambios */
  // public current: IntentModel;
  /** Contiene el nombre del contexto actual */
  public currentContexto?: string;
  /** Suscripción a los parámetros de la ruta activa */
  // private paramSubs: Subscription;
  /** Contiene el nombre del intent actual */
  private intentName?: string;
  /** Contiene la ruta de FIRESTORE del mensaje actual */
  // private mensajesPath: string;
  /** Contiene la ruta a la API */
  private _url = environment.restURL + '/intent';
  // respuestasSubs: Subscription;
  respuestasList$ = new BehaviorSubject<RespuestaModel[]>([]);
  // currentSubscription: Subscription
  entityTypes$ = new BehaviorSubject<(EntityTypeModel | iSystemEntity)[]>([]);

  constructor(
    private _afs: AngularFirestore,
    private _loading: MxLoading,
    private _cache: MxCache,
    private _alerts: MxAlert,
    private _http: HttpClient,
    private _commons: MxCommonsService,
    private _router: Router,
    private _intents: IntentsService,
    private _entityTypes: EntityTypesService,
    private _systemEntites: SystemEntitiesService,
    private _dialogflowIntents: DialogflowIntentsService,
  ) {
    // this.current$.subscribe(mensaje => console.log(mensaje))
  }



  /** Define la ruta del angente actual
   * @param {string} [functionName] Opcionalmente, ingresa el nombre de la funcion para seguimiento del error
   * @returns {*}  {string} Ruta del proyecto
   */
  projectPath( functionName?: string ) {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const userId = this._cache.getDataKey<string>( 'userId' )

    if ( !userId ) {
      throw new MxErrorAlertModel( `No se encontró el userId`, `current-intent.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `current-intent.service#${functionName}` )
    } else {
      let path = `usuarios/${ userId }/agentes/${ projectId }`
      return path
    }
  }



  /**
   * Obtiene los parámetros de la ruta cuando se ingresa a editar un mensaje
   * @return {*} Obserbavle con variable 'mensajeName' y 'currentContexto'
   */
  private getParams() {
    return forkJoin({
      ['mensajeName']: this._loading.getRouteParams().pipe(pluck('name')),
      ['currentContexto']: this._loading
        .getRouteQueryParams()
        .pipe(pluck('contexto')),
    });
  }



  /** Establece en el storage el intent actual y emite un evento para current$
   * @param {string} displayNameOname
   * @param {string} [contexto]
   */
  set(displayNameOname: string, contexto?: string): Observable<iIntentState> {
    this.intentName = displayNameOname
    return this._intents.find$( displayNameOname ).pipe(
      map( intentState => {
        if ( intentState ) {
          this._cache.updateData( 'currentContexto', contexto );
          this._cache.updateData( 'intentId', intentState.name)
          this.state$.next( intentState )
          this._entityTypes.filterByParams( intentState.intent.parameters )
            .pipe(take( 1 ))
            .subscribe(this.entityTypes$)
          return intentState
        } else {
          throw new MxErrorAlertModel( `No se encontró el intent seleccionado`, 'set')
        }
      }),
      catchError( ( error ) => {
        if ( 'message' in error ) {
          throw this._alerts.error(error.message, error)
        } else {
          throw this._alerts.error(`No se pudo setear el intenr actual`, error)
        }
      })
    )

    // this.getResponses(intentState.intent.name)
  }



  // UPDATE MENSAJE ACTUAL
  // mensajeUpdated$: Subject<any> = new Subject()
  /** Actualiza el intent actual en DIALOGFLOW con los cambios hechos en el área de entrenamiento. */
  async update() {
    this._loading.toggleWaiting('open');

    try {
      const current = this.state$.getValue()
      if ( current ) {
        await this._intents.update(current)
        this.state$.next( { ...current, unsaved: false } )
        this._alerts.notify('Guardado');
        this._loading.toggleWaiting('close');
        return;

      } else throw new MxErrorAlertModel(`No se ha seleccionado intent como actual`)

    } catch ( error ) {
      if ( 'mensaje' in error )
        this._alerts.error( error.message, error );
      else
        this._alerts.error('No se pudo guardar', error);
      this._loading.toggleWaitingBar();
      return console.error(error);
    }
  }



  /** Desuscribe todos los datos en este servicio */
  unsubscribe() {
    this.state$.next(null)
    this.entityTypes$.next([])
  }
}
