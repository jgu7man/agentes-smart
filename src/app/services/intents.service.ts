import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, first, map, mergeMap, pluck, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { iDialogflowIntent, DialogflowIntentModel, IntentStateModel, iIntentState } from '../models/intent.model';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { iContext } from '../models/context.model';
import { RespuestaModel } from '../models/intent-response.model';

@Injectable({ providedIn: 'root', })
export class IntentsService {

  /** Observable de la lista de mensajes filtrados por contexto en firebase */
  public intentListByContext$ = new BehaviorSubject<IntentStateModel[]>([]);

  constructor(
    private _afs: AngularFirestore,
    private _cache: MxCache,
    private _alert: MxAlert,
    private _loading: MxLoading,
    private _dialgoflowIntents: DialogflowIntentsService
  ) {
    this.retriveFromDialogfow()
  }



  /** Define la ruta del angente actual
   * @param {string} [functionName] Opcionalmente, ingresa el nombre de la funcion para seguimiento del error
   * @returns {*}  {string} Ruta del proyecto
   */
  projectPath(functionName?: string): string {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const userId = this._cache.getDataKey<string>( 'userId' )

    if ( !userId ) {
      throw new MxErrorAlertModel( `No se encontró el userId`, `itents.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `itents.service#${functionName}` )
    } else {
      return `usuarios/${userId}/agentes/${ projectId }`
    }
  }




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
        const intentResult = await this._dialgoflowIntents.post( dfIntent );

        const intentState: IntentStateModel = new IntentStateModel(intentResult, index, contexto)
        console.log( intentState )

        const intentRef = this._afs.doc( `${this.projectPath('create')}/intents/${intentState.name}` )
        console.log( `Guardando intent en firestore: `, intentState );
        await intentRef.set( { ...intentState } )
          .catch( error => {
            throw new MxErrorAlertModel( `Error al guardar el intent ${ intentResult.name } en firestore`, 'create',  error )
          } )

        // this.getDialogFlowIntents();
        this._loading.toggleWaiting('close');
        this._alert.notify('Mensaje creado')
        return
      } else throw new MxErrorAlertModel(`No se encontró el projectId`, 'create')

    } catch (error) {
      this._loading.toggleWaiting('close');
      this.catchCreateErrors(error)
      console.error( error );
      return
    }
  }



  // # SET CONTEXT TO CONTEXT INTENT
  /**
   * Setea el contexto nuevo al intent de contextos como un
   * parámetro y una frase de entreamiento más.
   * @param {string} context
   */
  // setContextIntent(context: string) {
  //   const intentList = this._cache.getDataKey<iDialogflowIntent[]>( 'intents' ) || []
  //   const contextIntent = intentList.find(
  //     (i) => i.displayName === 'Default Context Intent'
  //   );

  //   if ( contextIntent ) {
  //     if (!contextIntent.parameters) contextIntent.parameters = []
  //     // contextIntent.parameters.push({
  //     //   defaultValue: context,
  //     //   displayName: context,
  //     //   entityTypeDisplayName: context,
  //     //   isList: false,
  //     //   mandatory: false,
  //     //   value: context,
  //     // });

  //     if (!contextIntent.trainingPhrases) contextIntent.trainingPhrases = []
  //     contextIntent.trainingPhrases.push({
  //       parts: [
  //         {
  //           alias: context,
  //           entityType: '@contextos',
  //           text: context,
  //           userDefined: true,
  //         },
  //       ],
  //       type: 'EXAMPLE',
  //     });

  //   }

  //   // console.log(contextIntent)
  //   // this._current.update(contextIntent);
  // }



  // $READ MENSAJES



  /** Obtiene el observable de los intents del agente en curso
   * @readonly
   * @type {Observable<iIntentState[]>}
   */
  public get list$(): Observable<iIntentState[]>{
    const path = `${this.projectPath('list$')}/intents`

    return this._afs.collection<iIntentState>( path ).valueChanges()
      .pipe(

        catchError( ( error ) => {
          this._alert.error(`Error al obtener los intents`, error)
          return of([])
        } )

      )
  }



  /** Obtiene la lista de intents en promesa a partir del observable
   * @readonly
   * @type {Promise<iIntentState[]>}
   */
  public get list(): Promise<iIntentState[]>{
    try {
      return this.list$.pipe( take( 1 )).toPromise()
    } catch (error) {
      if ('mensaje' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(``, error)
      }
      return new Promise(() => [])
    }
  }



  // # GET INTENTS LIST BY CONTEXTO
  /** Obtiene los intents de Firestore que coinciden con tener el contexto indicado
   * @param {iContext} context Indica el contexto al cual pertenece la fila donde se invoca la lista de mensajes
   * @return {Observable<IntentStateModel[]>} Observable de intents states en array
   */
  getByContext$(context: iContext): Observable<iIntentState[]> {
    try {
      if ( context.id ) {

        return this._afs.collection<iIntentState>(
          `${this.projectPath( 'getByContext' )}/intents`,
          ref => ref
            .where( 'contexto', '==', context.name )
            .orderBy( 'index' )
        ).valueChanges()
          .pipe(

            catchError( error => {
              throw new MxErrorAlertModel( `Error obteniendo los intents del contexto ${ context.name }`,'getByContext', error )
            } )

        )

      } else {
        throw new MxErrorAlertModel(`No se proporionó ID del contexto`, 'getByContext')
      }
    } catch ( error ) {
      this.handleIntentErrors( error)
      if ('mensaje' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(`No se pudieron obtener  los intents del contexto ${context}`, error)
      }
      return of([])
    }
  }



  /** Obtiene los intents de firestore que no tienen contexto asignado
   * @returns {*}  {Observable<iIntentState[]>}
   */
  getWithoutContext$(): Observable<iIntentState[]> {

    return this._afs.collection<iIntentState>(
      `${this.projectPath( 'getByContext')}/intents`,
      ref => ref.where( 'contexto', '==', 'no-context' )
    ).valueChanges().pipe(
      catchError( e => {
        let error = new MxErrorAlertModel(
          `Error cargando los intents sin contextos`, 'getWithoutContext', e )
        this.handleIntentErrors(error)
        return of([])
      })
    )
  }


  find$( displayNameOrName: string ): Observable<iIntentState | null> {
    let path = `${ this.projectPath( 'find' ) }/intents`

    return this._afs.collection<iIntentState>( path, ref => ref
      .where( 'name', '==', displayNameOrName )
      .where( 'displayName', '==', displayNameOrName )
    ).get().pipe(

      map( result => {
        if ( result.size === 1 ) {
          return result.docs[ 0 ].data()

        } else if ( result.size > 1 ) {
          new MxErrorAlertModel(
            `El intent esta duplicado o hay coincidencias displayName con name.`,
            `${ result.docs.map(i => i.id).join(', ')}`)
          return null

        } else {
          new MxErrorAlertModel( `No se encontró el intent ${ displayNameOrName } `, 'findIntent' )
          return null

        }
      }),

      catchError( error => {
        this.handleIntentErrors( error )
        return of(null)
      })
    )
  }

  /** Busca el intent por name o displayName
   * @param {string} displayNameOrName
   * @returns {*}  {Promise<iIntentState>}
   */
  async find( displayNameOrName: string ): Promise<iIntentState | null> {
    try {
      return await this.find$(displayNameOrName).pipe( take( 1 )).toPromise()
    } catch (error) {
      this.handleIntentErrors( error )
      return null
    }
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
  async getNextIntents( intentName: string ): Promise<string[]> {
    let path = `${this.projectPath('getMensajes')}/intents/${intentName}/respuestas`

    return this._afs.collection<RespuestaModel>( path )
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



  /** Actualiza el intent que se entregue como parámetro
   * @param {iIntentState} intentState
   * @returns {*}
   */
  async update( intentState: iIntentState ): Promise<void> {
    const path = `${ this.projectPath }/intents`
    const intent = intentState.intent

    try {
      // Update in dialogflow
      await this._dialgoflowIntents.put(intent)
      // Update in firestore
      await this._afs.doc<iIntentState>( `${path}/${intentState.name}` )
        .update( {
          ...intentState,
          unsaved:false
        } )

        .catch( error => {
          throw new MxErrorAlertModel( 'Error de firebase para actualizar el intent', 'intent.service#update', error )
        } )

    } catch (error) {
      this.handleIntentErrors(error)
      return console.error(error)
    }
  }



  /** Ordena los intents de una columna de contextos de la UI
   * @param {iIntentState[]} list
   * @returns {*}
   */
  async orderContextIntents(list: iIntentState[]) {
    try {
      const path = `${this.projectPath('orderContextIntens')}/intents`
      const intentsRef = await this._afs.collection(path).ref
      const batch = this._afs.firestore.batch()


      await this._loading.asyncForEach( list, ( intentState: iIntentState, i: number ) => {

        intentState.index = i
        batch.update(intentsRef.doc(intentState.name), {...intentState})
        return intentState

      })


      return batch.commit()

    } catch (error) {
      if ('message' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(`No se pudo actualizar el orden de los intents`, error)
      }
      return console.error(error)
    }
  }



  /** Permite restaurar un intent default de dialogflow a su estado original como nuevo o recuperarlo si se ha perdido
   * @param {('Default Welcome Intent'
   *       | 'Default Fallback Intent'
   *       | 'Default Context Intent')} displayName
   */
  async restoreDefaultIntent(
    displayName:
      | 'Default Welcome Intent'
      | 'Default Fallback Intent'
      | 'Default Context Intent'
  ) {
    this._loading.toggleWaiting('open');
    const batch = this._afs.firestore.batch()
    const intentsPath = `${ this.projectPath( 'restoreDefaultIntent' ) }/intents`
    const intentState = await this.find(displayName)

    try {

        if ( intentState ) {
          const intentRef = this._afs.doc( `${intentsPath}/${intentState.name}` ).ref
          const responses = await intentRef.collection( 'responses' ).get()

          await this._loading.asyncForEach( responses.docs, response => {
            batch.delete( response.ref)
          })

          batch.delete( intentRef )
          await batch.commit()

        }

        await this.create(displayName)

        this._loading.toggleWaiting('close');
        this._alert.notify(displayName + ' creado');

    } catch (error) {
      if ('message' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(`Error al restaurar el intent`, error)
      }
      return console.error(error)
    }
  }



  /** Elimina el intent en DIALOGFLOW y después en FIRESTORE
   * @param {string} intentName name del intent
   * @returns {*}
   */
   async delete( intentName: string ): Promise<void> {
    const batch = this._afs.firestore.batch()
    const path = `${ this.projectPath( 'delete' ) }/intents/${ intentName }`;
    const intentRef = this._afs.doc(path).ref

    try {
      await this._dialgoflowIntents.delete( intentName );
      const intentDoc = await intentRef.get()

      const responses = await intentDoc.ref.collection( 'responses' ).get()
      await this._loading.asyncForEach( responses.docs, response => {
        batch.delete( response.ref)
      })

      batch.delete( intentRef )
      await batch.commit()

      return;
    } catch (error) {
      if ('message' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(`No se pudo eliminar el intent`, error)
      }
      return console.error(error)
    }
  }






  // # GET DIALOGFLOW INTENTS
  /** Obtiene respuesta de los intents registrados en el agente de Dialogflow  y actualiza en firestore*/
  private async retriveFromDialogfow(): Promise<void> {
    const path = `${ this.projectPath( 'retriveFromDialogfow' ) }/intents`
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const batch = this._afs.firestore.batch()
    const intentRef = this._afs.collection( path )


    try {
      const list = await this._dialgoflowIntents.get() || []

      // ACTUALIZA EN FIRESTORE
      await this._loading.asyncForEach( list,
        (intent: iDialogflowIntent ) => {
          let name = intent.name.slice(intent.name.lastIndexOf('/') + 1)
          return batch.set(intentRef.doc(name).ref, {intent}, { merge: true} )
        } )

      await batch.commit().catch( error => {
        throw new MxErrorAlertModel( `Error en el commit actualizando intents a ${path}`,'intents.service#retriveFromDialogfow', error)
      })

      return
    } catch (error) {
      if ('message' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(`Error desconocido actualizando los intent del agente ${projectId}`, error)
      }
      return console.error(error)
    }
  }



  /** Captura el error de la creación del intent
   * @private
   * @param {*} error
   */
  private catchCreateErrors(error: any) {

    if ( error.error.code === 3 ) {
      this._alert.error(
        'Este nombre de intent ya existe, por favor elige otro',
        error.error.error.details,
        'intents.service#create'
      );

    } else if ( error.error.code === 9 ) {
      this._alert.error(
        'El nombre del intent no sólo puede contener caracteres como LETRAS: [a-z, A-Z], números:[0-9], guión bajo [_], guión medio [-] o espacios',
        error.error.error.details,
        'intents.service#create'
      );

    } else if ( 'message' in error ) {
      this._alert.error(error.message, error,
        'intents.service#create')

    } else {
      this._alert.error('Error creando el intent nuevo', error.error.error.details,
      'intents.service#create');
    }
  }

  private handleIntentErrors(error: any) {
    if ( 'message' in error ) {
      this._alert.error(error.message, error)
    } else {
      this._alert.error('Error desconocido en servicio de interacciones', error)
    }
  }
}



@Injectable( { providedIn: 'root', } )
export class DialogflowIntentsService {

  private _url = environment.restURL + '/intent';
  constructor (
    private _http: HttpClient,
    private _cache: MxCache,
    private _alert: MxAlert,
  ){}

  async post(
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

  async get(): Promise<iDialogflowIntent[]> {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const projectPath = `${ this._url }/${ projectId }`
    const headers  = new HttpHeaders({ responseType: 'json' })

    try {

      if ( !projectId ) throw new MxErrorAlertModel( `No se tienen el projectId` )
      return await this._http.get<iDialogflowIntent[]>(projectPath, {headers}).pipe(
        // tap(data => console.log( data )),
        first(),
        pluck<any, iDialogflowIntent[]>( 'result', 'intents' ),

        catchError( error => {
          throw new MxErrorAlertModel( `Error desde el servidor al tratar de obtener los intent del agente ${ projectId }`, 'intents.service#DialogFlowIntentservice:get', error )
        } )

      ).toPromise()

    } catch (error) {
      if ('message' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(`No se pudo obtener los intents del servidor`, error)
      }
      return []
    }
  }

  /** Actualiza el intent actual en DIALOGFLOW a través de la API
   * @private
   * @param {IntentStateModel} intent
   * @returns {*}  {Promise<IntentModel>}
   */
   put(intent: iDialogflowIntent): Promise<iDialogflowIntent> {
    const projectId = this._cache.getDataKey('projectId');
    const path = `projects/${projectId}/agent/intents/${intent.name}`;
    const body = { intent: { ...intent, name: path }};

    const headers = { responseType: 'json' };

    return new Promise((resolve, reject) => {
      this._http
        .put(this._url, body, { headers })
        .toPromise()
        .then((response: any) => {
          if (response['intent']) {
            this._alert.notify(`Intent Actualizado`);
            resolve(response['intent']);
          } else {
            throw new MxErrorAlertModel(`La respuesta no contiene intent`)
          }
        })
        .catch((err) => {
          if (err) {
            console.error( err );
            throw new MxErrorAlertModel( `Error actualizando`)
          }
          reject(err);
        });
    });
  }

  /**
   * Elimina el intent desde la API
   * @private
   * @param {string} intentId
   * @returns {*}  {Promise<any>}
   */
   public delete(intentId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const projectId = this._cache.getDataKey<string>('projectId');

      this._http
        .delete(this._url + `/${intentId}/project/${projectId}`)
        .toPromise()
        .then((response) => { resolve(response); })
        .catch((err) => {
          if (err) {
            console.log(err);
            this._alert.error( 'No es posible elimnar intent', err);
          }
          // reject(true);
        });
    });
  }
}
