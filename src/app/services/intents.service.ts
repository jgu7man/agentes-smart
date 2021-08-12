import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, first,  map,  mergeMap,  pluck, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { iDialogflowIntent, DialogflowIntentModel, IntentModel as IntentStateModel, iIntentState } from '../models/intent.model';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { iContext } from '../models/context.model';
import { RespuestaModel } from '../models/intent-response.model';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IntentsService {
  /** Almacena la ruta de los mensajes, incluyendo ID de usuario y de proyecto */
  private mensajesPath!: string;
  /** Motiva a recargar los mensajes */
  // reloadMensajes$ = new Subject<any>();
  /** Almacena la URL para consultas de la API */
  private _url = environment.restURL + 'intent';
  /** Observable de la lista de mensajes filtrados por contexto en firebase */
  public intentListByContext$ = new BehaviorSubject<IntentStateModel[]>([]);

  // public list$!: Observable<iDialogflowIntent[]>

  constructor(
    private _http: HttpClient,
    private _af: AngularFirestore,
    private _cache: MxCache,
    private _alert: MxAlert,
    private _loading: MxLoading,
  ) {
  }

  projectPath(functionName?: string): string {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'clientId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, `itents.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `itents.service#${functionName}` )
    } else {
      return `usuarios/${clientId}/agentes/${ projectId }`
    }
  }




  // SECTION CRUD de mensajes

  // $CREATE Mensajes

  // # SAVE NEW MENSAJE
  /** Agrega el intent nuevo creado por la API a dialogflow como referencia para la interfaz en FIRESTORE
   * @param {iDialogflowIntent} displayName intent creado por la API
   * @param {number} [index] index en el orden del contexto
   * @param {string} [contexto] contexto con el que será invocado en la interfaz
   */
  public async create(
    displayName: string,
    index?: number,
    contexto?: string
  ): Promise<void> {
    this._loading.toggleWaiting('open');
    const projectId = this._cache.getDataKey<string>( 'projectId' )

    try {
      if ( projectId ) {

        const dfIntent = new DialogflowIntentModel( projectId, displayName, contexto )
        const intentResult = await this.createDialogflowIntent(dfIntent);
        const intentState: IntentStateModel = new IntentStateModel(intentResult, index, contexto)

        const intentRef = this._af.doc( `${this.projectPath('create')}/intents/${intentState.name}` )
        console.log( `Guardando intent en firestore: `, intentState );
        await intentRef.set( { ...intentState } )
          .catch(error => {throw new MxErrorAlertModel(`Error al guardar el intent ${intentResult.name} en firestore`, error)} )

        // this.getDialogFlowIntents();
        this._loading.toggleWaiting('close');
        this._alert.notify('Mensaje creado')
        return
      } else throw new MxErrorAlertModel(`No se encontró el projectId`, 'saveNew')


    } catch (error) {
      this._loading.toggleWaiting('close');
      this.catchCreateErrors(error)
      return console.error(error);
    }
  }

  async createDialogflowIntent(
    { displayName, inputContextNames }: DialogflowIntentModel
  ): Promise<iDialogflowIntent> {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const intentRequest: any = { displayName, inputContextNames };
    const body = { projectId, intentRequest };

    return this._http.post( this._url, body, { responseType: 'json' } )
      .pipe(
        first(),
        pluck<any, iDialogflowIntent>('intent'),

        catchError( error => {
          throw new MxErrorAlertModel(`Error del servidor creando un nuevo intent`, error)
        } )

      ).toPromise()
  }

  private catchCreateErrors(error: any) {

    if ( error.error.code === 3 ) {
      this._alert.error(
        'Este nombre de intent ya existe, por favor elige otro',
        error.error.error.details
      );

    } else if ( error.error.code === 9 ) {
      this._alert.error(
        'El nombre del intent no sólo puede contener caracteres como LETRAS: [a-z, A-Z], números:[0-9], guión bajo [_], guión medio [-] o espacios',
        error.error.error.details
      );

    } else if ( 'message' in error ) {
      this._alert.error(error.message, error)

    } else {
      this._alert.error('Error creando el intent nuevo', error.error.error.details);
    }
  }

  // !$CREATE






  // # SET CONTEXT TO CONTEXT INTENT
  /**
   * Setea el contexto nuevo al intent de contextos como un
   * parámetro y una frase de entreamiento más.
   * @param {string} context
   */
  setContextMensaje(context: string) {
    const intentList = this._cache.getDataKey<iDialogflowIntent[]>( 'intents' ) || []
    const contextIntent = intentList.find(
      (i) => i.displayName === 'Default Context Intent'
    );

    if ( contextIntent ) {
      if (!contextIntent.parameters) contextIntent.parameters = []
      // contextIntent.parameters.push({
      //   defaultValue: context,
      //   displayName: context,
      //   entityTypeDisplayName: context,
      //   isList: false,
      //   mandatory: false,
      //   value: context,
      // });

      if (!contextIntent.trainingPhrases) contextIntent.trainingPhrases = []
      contextIntent.trainingPhrases.push({
        parts: [
          {
            alias: context,
            entityType: '@contextos',
            text: context,
            userDefined: true,
          },
        ],
        type: 'EXAMPLE',
      });

    }

    // console.log(contextIntent)
    // this._current.update(contextIntent);
  }



  // $READ MENSAJES

  public get list$(): Observable<iIntentState[]>{
    const path = `${this.projectPath('list$')}/intents`

    return this._af.collection<iIntentState>( path ).valueChanges()
      .pipe(

        catchError( ( error ) => {
          this._alert.error(`Error al obtener los intents`, error)
          return of([])
        } )

      )
  }




  // # GET DIALOGFLOW INTENTS
  /** Obtiene respuesta de los intents registrados en el agente de Dialogflow  y actualiza en firestore*/
  async updateIntents(): Promise<void> {
    const path = `${ this.projectPath( 'getDialogFlowIntents' ) }/intents`
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const batch = this._af.firestore.batch()
    const intentRef = this._af.collection( path )


    try {
      if ( !projectId ) throw new MxErrorAlertModel( `No se tienen el projectId` )


      let list = await this._http.get<iDialogflowIntent[]>(
        `${this._url}/${projectId}`,
        { responseType: 'json' }
      ).pipe(
        // tap(data => console.log( data )),
        first(),
        pluck<any, iDialogflowIntent[]>( 'result', 'intents' ),

        catchError( error => {
          throw new MxErrorAlertModel( `Error desde el servidor al tratar de obtener los intent del agente ${ projectId }`, error )
        } )

      ).toPromise()


      // ACTUALIZA EN FIRESTORE
      await this._loading.asyncForEach( list,
        (intent: iDialogflowIntent ) => {
          let name = intent.name.slice(intent.name.lastIndexOf('/') + 1)
          return batch.update(intentRef.doc(name).ref, {intent} )
        } )


      await batch.commit().catch( error => {
        throw new MxErrorAlertModel( `Error en el commit actualizando intents a ${path}`, error)
      })


      return
    } catch (error) {
      if ('mensaje' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(`Error desconocido actualizando los intent del agente ${projectId}`, error)
      }
      return console.error(error)
    }
  }




  // # MENSAJES LIST BY CONTEXT
  // # GET MENSAJES LIST BY CONTEXTO
  /** Obtiene los Mensajes de Firestore que coinciden con tener el contexto indicado
   * @param {iContext} contexto Indica el contexto al cual pertenece la fila donde se invoca la lista de mensajes
   * @return {Observable<IntentStateModel[]>} Regresa un array de mensajes pertenecientes al contexto
   */
  getByContext$(contexto: iContext): Observable<iIntentState[]> {
    if ( contexto.id ) {

      return this._af.collection<iIntentState>( this.projectPath( 'getByContext' ),
        ref => ref
          .where( 'contexto', '==', contexto.contextName )
          .orderBy( 'index' )
      ).valueChanges()
        .pipe(

          catchError( error => {
            new MxErrorAlertModel( `Error obteniendo los intents del contexto ${ contexto.contextName }`, error )
            return of([])
          } )

      )

    } else {
      let error = new MxErrorAlertModel(`No se proporionó ID del contexto`, 'getByContext')
      throw this._alert.error(error.message, error )
    }
  }

  getWithoutContext$(): Observable<iIntentState[]> {

    return this._af.collection<iIntentState>( this.projectPath( 'getByContext' ),
      ref => ref.where( 'contexto', '==', 'no-context' )
    ).valueChanges().pipe(
      catchError( error => {
        this._alert.error( `Error cargando los intents sin contextos`, error );
        return of([])
      })
    )
  }

  // private async validateMensajesList(
  //   mensajes: IntentModel[]
  // ): Promise<IntentModel[]> {
  //   const list = this._cache.getDataKey<iDialogflowIntent[]>( 'intents' )
  //   if (list.length === mensajes.length) return mensajes;
  //   else {
  //     return mensajes.map((m) => {
  //       let finded = list.find((i) => i.displayName === m.displayName);
  //       if (finded) return finded;
  //       else {
  //         this._af.collection(this.mensajesPath).doc(m.name).delete();
  //       }
  //     });
  //   }
  // }

  // # GET NEXT MENSAJES BY ID
  /** Obtiene los mensajes siguientes del mensaje que solicita mediente su ID
   * @param {string} intentName Id del mensajes del cuál se solicita saber sus siguientes mensajes
   * @return {*} Array de mensajes siguientes del mensaes
   */
  getNextIntents( intentName: string ): Promise<string[]> {
    let path = `${this.projectPath('getMensajes')}/intents/${intentName}/respuestas`

    return this._af.collection<RespuestaModel>( path )
      .valueChanges()
      .pipe(
        take( 1 ),
        mergeMap( async respuestas => {
          var following: string[] = [];

          await this._loading.asyncForEach( respuestas, ( respuesta ) => {
            let resStored = following.findIndex( (r) => r == respuesta.nextIntent );
            if (resStored < 0) following.push(respuesta.nextIntent as string);
          });

          return following
        }))
      .toPromise()
      .catch( error => {
        this._alert.error( `No se pudieron obtener los intents siguientes a ${ intentName }`, error )
        return []
      })
  }

  async orderContextIntens(list: iIntentState[]) {
    try {
      const path = `${this.projectPath('orderContextIntens')}/intents`
      const intentsRef = await this._af.collection(path).ref
      const batch = this._af.firestore.batch()


      await this._loading.asyncForEach( list, ( intentState: iIntentState, i: number ) => {

        intentState.index = i
        batch.update(intentsRef.doc(intentState.name), {...intentState})
        return intentState

      })


      return batch.commit()

    } catch (error) {
      if ('mensaje' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(`No se pudo actualizar el orden de los intents`, error)
      }
      return console.error(error)
    }
  }
}
