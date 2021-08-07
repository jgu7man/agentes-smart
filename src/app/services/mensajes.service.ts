import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of, Subject, BehaviorSubject, Observable } from 'rxjs';
import { filter, first, flatMap, map, pluck, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import firebase from 'firebase/app';
import { iDialogflowIntent, DialogflowIntentModel, IntentModel, iIntent } from '../models/mensaje.model';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading, MxText } from '@marxa/devkit';
import { AgenteModel } from '../models/agente.model';
import { ContextoModel } from '../models/contexto.model';
import { RespuestaModel } from '../models/respuesta.model';

@Injectable({
  providedIn: 'root',
})
export class MensajesService {
  /** Almacena la ruta de los mensajes, incluyendo ID de usuario y de proyecto */
  private mensajesPath!: string;
  /** Almacena el ID del proyecto actual */
  private projectId!: string | null;
  /** Motiva a recargar los mensajes */
  // reloadMensajes$ = new Subject<any>();
  /** Almacena la URL para consultas de la API */
  private _url = environment.restURL + 'intent';

  public list$!: Observable<iDialogflowIntent[]>

  constructor(
    private _http: HttpClient,
    private _af: AngularFirestore,
    private _cache: MxCache,
    private _alerts: MxAlert,
    private _loading: MxLoading,
    private _text: MxText,
    // private _current: CurrentMensajeService,
    private _router: Router
  ) {
    this.projectId = this._cache.getDataKey( 'projectId' )
    // this.mensajesCollection()
  }

  /** Obtine la referencia actual a FIRESTORE para los mensjaes */
  mensajesCollection<T>() {
    this.mensajesPath = `${this._cache.getDataKey('agentePath')}/mensajes`;
    const mensajesRef = this._af.collection<T>(this.mensajesPath);
    return mensajesRef;
  }

  intentsPath(functionName?: string) {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'clientId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, functionName )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, functionName )
    } else {
      return `usuarios/${clientId}/agentes/${ projectId }/mensajes`
    }
  }


  // SECTION CRUD de mensajes

  // $CREATE Mensajes

  // # CREATE NEW INTENT IN DIALOGFLOW
  /** Crear un intent nuevo en DIALOGFLOW a través de la API
   *@param projectId id del projecto
   *@param intent displayname nombre del intent */
  createNewIntent({displayName, inputContextNames}: DialogflowIntentModel): Promise<iDialogflowIntent> {
    let intentRequest: any = {
      displayName, inputContextNames,
      webhookState: 'WEBHOOK_STATE_ENABLED_FOR_SLOT_FILLING',
    };

    const body = { projectId: this.projectId, intentRequest };

    return new Promise<iDialogflowIntent>((resolve, reject) => {
      this._http
        .post( this._url, body, { responseType: 'json' } )
        .pipe(first())
        .subscribe( (intentCreated: any) => {
            // console.log('IntentCreated:', intentCreated['intent']);
            resolve(intentCreated['intent']);
            this.getDialogFlowIntents();
          },(onError) => {
            // this._alerts.sendError('Algo falló', onError);
            reject(onError);
          }
        );
    });
  }

  // # SAVE NEW MENSAJE
  /** Agrega el intent nuevo creado por la API a dialogflow como referencia para la interfaz en FIRESTORE
   * @param {iDialogflowIntent} displayName intent creado por la API
   * @param {number} [index] index en el orden del contexto
   * @param {string} [contexto] contexto con el que será invocado en la interfaz
   */
  public async saveNew(
    displayName: string,
    index?: number,
    contexto?: string
  ) {
    this._loading.toggleWaiting('open');
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'clientId' )

    try {
      if ( !clientId ) {
        throw new MxErrorAlertModel(`No se encontró el clientId`, 'saveNew')
      } else if ( !projectId ) {
        throw new MxErrorAlertModel(`No se encontró el projectId`, 'saveNew')
      } else {

        const dfIntent = new DialogflowIntentModel(
          projectId, displayName, contexto
        )
        let intentResult = await this.createNewIntent(dfIntent);
        let intent: IntentModel = new IntentModel(intentResult, index, contexto)
        const intentRef = this._af.doc( `${this.intentsPath('saveNew')}/${intent.name}` )
        console.log(`guardando intent en firestore: `, intent);
        await intentRef.set( intent );

        this.getDialogFlowIntents();
        this._loading.toggleWaiting('close');
        this._alerts.notify('Mensaje creado')
        return
      }


    } catch (error) {
      console.error(error);
      this._loading.toggleWaiting('close');
      if (error.error.code === 3) {
        this._alerts.error(
          'Este nombre de intent ya existe, por favor elige otro',
          error.error.error.details
        );
      } else if (error.error.code === 9) {
        this._alerts.error(
          'El nombre del intent no sólo puede contener caracteres como LETRAS: [a-z, A-Z], números:[0-9], guión bajo [_], guión medio [-] o espacios',
          error.error.error.details
        );
      } else if ( 'message' in error ) {
        this._alerts.error(error.message, error)
      } else {
        this._alerts.error('Error creando el intent nuevo', error.error.error.details);
      }
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
      contextIntent.parameters.push({
        defaultValue: context,
        displayName: context,
        entityTypeDisplayName: context,
        isList: false,
        mandatory: false,
        value: context,
      });

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
  // Se obtienen los intents configurados en dialogflow y se almacenan en caché

  intializeMensajes() {
    this._cache.listenForChanges<AgenteModel>('currentAgente')
      .pipe(filter(agente => !!agente),
        flatMap(() => this._cache.listenForChanges('intents')),
        // flatMap(() =>)
      )
  }

  // # GET DIALOGFLOW INTENTS
  /** Obtiene respuesta de los intents registrados en el agente de Dialogflow */
  getDialogFlowIntents() {
    const projectId = this._cache.getDataKey<string>( 'projectId' );
    const clientId = this._cache.getDataKey<string>( 'clientId' )
    if ( !projectId ) {
      throw this._alerts.error(`No se encontró el projectId`, 'getDialogFlowIntents')
    } else if ( !clientId ) {
      throw this._alerts.error(`No se encontró el clientId`, 'getDialogFlowIntents')
    } else {
      let intentsPath = `usuarios/${ clientId }/agentes/${ projectId }/mensajes`

      return this._http.get<iDialogflowIntent[]>(
        `${this._url}/${projectId}`,
        { responseType: 'json' }
      ).pipe(
        // tap(data => console.log( data )),
        first(),
        pluck<any, iDialogflowIntent[]>( 'result', 'intents' ),
        map<iDialogflowIntent[], iDialogflowIntent[]>( list => {
          this.updateIntents(this.intentsPath('getDialogFlowIntents'), list)
          return list.map((intent) => {
              intent.name = intent.name.slice(intent.name.lastIndexOf('/') + 1);
              return intent;
            });
        }),
        // tap(data => console.log( data )),
        tap((list) => this._cache.updateData('intents', list))
      )
    }

  }

  private async updateIntents(intentsPath: string, list: iDialogflowIntent[]) {
    const batch = this._af.firestore.batch()
    const intentRef = this._af.collection( intentsPath )
    await this._loading.asyncForEach( list,
      (intent: iDialogflowIntent ) => {
        let name = intent.name.slice(intent.name.lastIndexOf('/') + 1)
        return batch.update(intentRef.doc(name).ref, {intent} )
      } )
    await batch.commit()
    return
  }

  // # MENSAJES LIST BY CONTEXT
  /** Observable de la lista de mensajes filtrados por contexto en firebase */
  mensajesListByContext$: BehaviorSubject<IntentModel[]> = new BehaviorSubject(
    <IntentModel[]>[]
  );

  // # GET MENSAJES LIST BY CONTEXTO
  /** Obtiene los Mensajes de Firestore que coinciden con tener el contexto indicado
   * @param {ContextoModel} contexto Indica el contexto al cual pertenece la fila donde se invoca la lista de mensajes
   * @return {Observable<IntentModel[]>} Regresa un array de mensajes pertenecientes al contexto
   */
  getByContext(contexto: ContextoModel) {
    if ( contexto.id ) {
      return this._af.collection<iIntent>( this.intentsPath( 'getByContext' ),
        ref => ref
          .where( 'contexto', '==', contexto.contextName )
          .orderBy( 'index' )
      ).valueChanges()
    } else {
      let error = new MxErrorAlertModel(`No se proporionó ID del contexto`, 'getByContext')
      throw this._alerts.error(error.message, error )
    }
  }

  getWithoutContext() {
    return this._af.collection<iIntent>( this.intentsPath( 'getByContext' ),
      ref => ref.where( 'contexto', '==', 'no-context' )
    ).valueChanges()
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
   * @param {string} id Id del mensajes del cuál se solicita saber sus siguientes mensajes
   * @return {*} Array de mensajes siguientes del mensaes
   */
  getNextMensajes(id: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this._af
        .collection<RespuestaModel>(`${this.mensajesPath}/${id}/respuestas`)
        .valueChanges()
        .subscribe(async (respuestasCol) => {
          var following: string[] = [];
          if (respuestasCol.length > 0) {
            await this._loading.asyncForEach( respuestasCol,
              ( respuesta ) => {
              let resStored = following.findIndex(
                (r) => r == respuesta.nextIntent
              );
              if (resStored < 0) following.push(respuesta.nextIntent as string);
            });
          }
          return resolve(following);
        });
    });
  }

  async orderContextMensajes(list: iIntent[]) {
    const intentsRef = await this._af
      .collection(`${this.mensajesPath}`).ref

    const batch = this._af.firestore.batch()

    await this._loading.asyncForEach(list, (m:iIntent, i: number) => {
      m.index = i
      let id = m.name.slice(m.name.lastIndexOf('/')+ 1)
      batch.update(intentsRef.doc(id), {...m})
      return m
    })

    return batch.commit()

  }
}
