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

@Injectable({
  providedIn: 'root',
})
export class CurrentIntentService {
  /** Informa cuando el intent actual ha cambiado */
  public current$ = new BehaviorSubject<IntentStateModel>(
    new IntentStateModel(emptyIntent)
  );
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


  constructor(
    private _afs: AngularFirestore,
    private _loading: MxLoading,
    private _cache: MxCache,
    private _alerts: MxAlert,
    private _http: HttpClient,
    private _commons: MxCommonsService,
    private _router: Router,
    private _intents: IntentsService,
    private _systemEntites: SystemEntitiesService,
    private _dialogflowIntents: DialogflowIntentsService,
  ) {
    // this.current$.subscribe(mensaje => console.log(mensaje))
  }

  projectPath(functionName?: string) {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'userId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, functionName )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, functionName )
    } else {
      let path = `usuarios/${ clientId }/agentes/${ projectId }`
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


  /** Establece en el storage el intent actual y emite un evento para current$ */
  async setCurrent(displayNameOname: string, contexto?: string) {
    this.intentName = displayNameOname
    this._cache.updateData('currentContexto', contexto);
    this.findIntent(displayNameOname).pipe(
      // tap((data)=> console.log( data )),
      map( ( intentState ) => {
        this.current$.next(intentState)
        this.getIntentEntityTypes( intentState.intent.parameters )
        return intentState.intent
      } ),
      mergeMap((intent) => this.getRespuestasList(intent.name))
    )
  }


  findIntent(displayNameOname: string) {
    let path = `${this.projectPath( 'findIntent' )}/intents`
    return  this._afs.collection<iIntentState>( path, ref => ref
      .where( 'name', '==', 'displayNameOname' )
      .where( 'displayName', '==', 'displayNameOname' )
    ).get().pipe(
      map( list => {
        if ( !list.empty ) {
          return list.docs[0].data()
        } else {
          throw new MxErrorAlertModel(`No se encontró el intent ${displayNameOname} `, 'findIntent')
        }
      } ),
      catchError( error => {
        throw 'message' in error
          ? this._alerts.error( error.message, error)
          : this._alerts.error( `Hubo un problema al buscar el intent ${ displayNameOname }`, error )
      } )
    )
  }


  /**
   * Se suscribe a los cambios de FIRESTORE para obtener las respuestas del intent actual y estble la variable de respuestasList con la lista actualizada. También inserta la lista de respuestas en el storage
   *
   * @returns {RespuestaModel} Array de respuestas actualizado
   */
  getRespuestasList(mensajeName: string) {
    let path = `${this.projectPath('getRespuestasList')}/intents/${mensajeName}`;
    return this._afs
      .collection<RespuestaModel>(path)
      .valueChanges().pipe(
        map((respuestas) =>
          this._commons.sortBy<RespuestaModel>(respuestas, 'index')),
        tap((respuestas) =>
          this._cache.updateData('currentRespuestas', respuestas)),
      )
  }

  intentTypeEntities$ = new BehaviorSubject<(EntityTypeModel | iSystemEntity)[]>([]);
  /** Obtiene los tipos de datos del mensaje actual
   * @return {array} Arreglo de los tipos de datos del mensaje actual
   */
  async getIntentEntityTypes( paramList: iParameter[] ) {
    let entityTypesPath = `${this.projectPath('getMensajeTipos')}/entityTypes`
    const intentTypes = await this._afs.collection<EntityTypeModel>( entityTypesPath )
      .get().pipe( take( 1 ), map( list => {
        if ( !list.empty ) return list.docs.map( doc => doc.data() )
        else throw new MxErrorAlertModel(`No se logró cargar los entityTypes`, 'getMensajeTipos')
      } ) ).toPromise()

    const sysTypes: any = this._systemEntites.systemEntities
    const allTypes: (EntityTypeModel | iSystemEntity)[] = intentTypes.concat(sysTypes)

    const entities = this.intentTypeEntities$.getValue();
    paramList.forEach((param) => {
      let splited = param.entityTypeDisplayName.split('@')
      let paramEntity = splited[1] ? splited[1] : splited[0]
      if( paramEntity !== undefined){
        let typeStored: EntityTypeModel | iSystemEntity | undefined = entities.find(
          (t) => t && t.displayName == paramEntity
        );
        if (!typeStored || typeStored === undefined) {
          typeStored = allTypes.find(t => t.displayName == paramEntity)
          if ( typeStored ) {
            this.intentTypeEntities$.next([
              ...this.intentTypeEntities$.getValue(),
              typeStored,
            ]);
          }
        }
      }
    });

    return this.intentTypeEntities$;
  }

  // UPDATE MENSAJE ACTUAL
  // mensajeUpdated$: Subject<any> = new Subject()
  /** Actualiza el intent actual en DIALOGFLOW con los cambios hechos en el área de entrenamiento. */
  async update() {
    this._loading.toggleWaiting('open');

    try {
      const current = this.current$.getValue()
      if ( current ) {
        await this._intents.update(current)
        this.current$.next( { ...current, unsaved: false } )
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



  /**
   * Elimina el intent en DIALOGFLOW y después en FIRESTORE
   *
   * @param {string} intentName name del intent
   * @returns {*}
   */
  async delete( intentName: string ) {
    const batch = this._afs.firestore.batch()
    const path = `${ this.projectPath( 'delete' ) }/intents/${ intentName }`;
    const intentRef = this._afs.doc(path).ref

    try {
      await this.deleteIntentRequest( intentName );
      const intentDoc = await intentRef.get()

      const responses = await intentDoc.ref.collection( 'responses' ).get()
      await this._loading.asyncForEach( responses.docs, response => {
        batch.delete( response.ref)
      })

      batch.delete( intentRef )
      await batch.commit()

      return;
    } catch (error) {
      if ('mensaje' in error) {
        this._alerts.error(error.message, error)
      } else {
        this._alerts.error(``, error)
      }
      return console.error(error)
    }
  }

  /**
   * Elimina el intent desde la API
   * @private
   * @param {string} intentId
   * @returns {*}  {Promise<any>}
   */
  public deleteIntentRequest(intentId: string): Promise<any> {
    this._loading.toggleWaiting('open');
    return new Promise((resolve, reject) => {
      const projectId = this._cache.getDataKey<string>('projectId');

      this._http
        .delete(this._url + `/${intentId}/project/${projectId}`)
        .toPromise()
        .then((response) => { resolve(response); })
        .catch((err) => {
          if (err) {
            console.log(err);
            this._alerts.error( 'No es posible elimnar intent', err);
          }
          // reject(true);
        });
    });
  }

  /** Desuscribe todos los datos en este servicio */
  unsubscribe() {

    this._cache.deleteDataKey('currentIntent');
    this._cache.deleteDataKey('currentRespuestas');
    this.current$.next(new IntentStateModel(emptyIntent))
    // if (this.respuestasSubs) {
    //   this.respuestasSubs.unsubscribe();
    // }
    // if (this.intentListSubs) {
    //   this.intentListSubs.unsubscribe();
    // }
    // if (this.paramSubs) this.paramSubs.unsubscribe();
    // console.log('unsubscribe');
  }
}
