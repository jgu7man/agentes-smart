import firebase from 'firebase/app'
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject, Observable, Subscription, of } from 'rxjs';
import { filter, tap, map, flatMap, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { iDialogflowIntent, iIntentState } from '../models/intent.model';
import { iContext } from '../models/context.model';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { HttpClient } from '@angular/common/http';
import { ContextsService } from './contexts.service';
import { AgentsService } from './agents.service';
import { DashboardService } from './dashboard.service';
import { IntentsService } from './intents.service';
import { EntityTypesService } from './entitiy-types.service';
import {  iAgente } from '../models/agent.model';

@Injectable({
  providedIn: 'root',
})
export class CurrentAgentService {
  // SECTION CURRENT AGENTE

  // # CURRENT AGENT
  /** Estado presente del agente actual */
  public current?: iAgente;
  // # PROJECT ID
  /** Almacena el ID de projecto actual */
  // public projectId: string;
  // # PATH
  /** Almacena la ruta actual del agente actual del usuario actual */
  // public path: string;
  // # USER
  /** Almacena la información del usuario actual */
  public usuario?: firebase.User;
  // # AGENTE LOADED
  /** Escucha cuando el agente termina de ser cargado */
  public loaded$: Subject<boolean> = new Subject();
  /** Número de veces que se ha recargado el agente */
  private loads = 0;
  /** Almacena la URL del API */
  private _url = environment.restURL + '/intent';

  // intentList$: Observable<iDialogflowIntent[]>;
  // firestoreIntentList$: Observable<iIntent[]>
  // contextosList$: Observable<iContext[]>;
  // tiposList$: Observable<(TipoEntidadModel | SystemEntitieModel)[]>;
  // tarjetasList$: Observable<TarjetaModel[]>
  // coleccionesList$: Observable<ColeccionModel[]>


  constructor(
    private _afs: AngularFirestore,
    private _cache: MxCache,
    private router: Router,
    private _http: HttpClient,
    private _alert: MxAlert,
    private _loading: MxLoading,
    private _contexts: ContextsService,
    private _agentes: AgentsService,
    private _dashboard: DashboardService,
    private _mensajes: IntentsService,
    private _tipos: EntityTypesService
  ) {

    // this.firestoreIntentList$ = this.setObservables('mensajes')
    // this.contextosList$ = this.setObservables('contextos')
    // this.tiposList$ = this.setObservables('tipos')
    // this.tarjetasList$ = this.setObservables('taretas')
    // this.coleccionesList$ = this.setObservables('colecciones')

  }


  projectPath(functionName?: string): string {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'clientId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, `current-agent.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `current-agent.service#${functionName}` )
    } else {
      return `usuarios/${clientId}/agentes/${ projectId }`
    }
  }

  /** Obtiene un agente llamado por id
   * @param {string} projectId
   * @return {iAgente} Agente o null
   */
  async get( projectId: string ): Promise<iAgente | null> {
    const clientId = this._cache.getDataKey<string>( 'clientId' )

    try {
      if ( !clientId ) {
        throw new MxErrorAlertModel( `No se encontró el clientId`, 'get')
      } else if (!projectId) {
        throw new MxErrorAlertModel( `No se pudo obtener 'projectId': ${projectId}`, 'get' );
      } else {
        const agentDoc = await this._afs.doc<iAgente>
          ( `usuarios/${ clientId }/agentes/${ projectId }` )
          .ref.get()

        if (agentDoc.exists) {
          return agentDoc.data() as iAgente;
        } else {
          throw new MxErrorAlertModel( `No se encontró el agente ${projectId}`, 'get' );
        }
      }
    } catch (error) {
      console.error( error );
      if ( 'message' in error ) {
        this._alert.error(error.message, error)
      } else this._alert.error('Error en la base de datos', error);
      return null;
    }
  }


  setAsStarted() {
    const path = this.projectPath('setAsStarted')
    this._afs.doc(path).update({ started: true })
      .catch(error => {
        console.error(error);
        this._alert.error('No se pudo actualizar el tutorial, todo lo demás está bien', error)
      })
  }

  async setCurrentAgente(projectId: string) {
    // this._loading.toggleWaitingSpinner('open')
    // this.projectId = projectId;
    this._cache.updateData('projectId', projectId);
    await this._agentes.loadOne(projectId);
    // this._cache.updateData('currentAgente', this.current);
    // return this._dashboard.initializeDashboard()
    //   .pipe(
    //     tap(() => {
    //       console.group('init')
    //       this._loading.toggleWaitingSpinner('open')
    //     }),
    //     flatMap(() => this.getPath()),
    //     distinctUntilChanged(),
    //     tap(() => console.log( 'path loaded', )),
    //     flatMap(() => this.loadFirestoreList('mensajes')),
    //     tap(() => console.log( 'mensajes loaded', )),
    //     flatMap(() => this._contexts.getAllContexts()),
    //     tap(() => console.log( 'context loaded', )),
    //     flatMap(() => this._mensajes.getDialogFlowIntents()),
    //     tap(() => console.log( 'intent loaded', )),
    //     flatMap(() => this._tipos.getTiposList()),
    //     tap(() => console.log( 'tipos loaded', )),
    //     flatMap(() => this.loadFirestoreList('tarjetas')),
    //     tap(() => console.log( 'tarjetas loaded', )),
    //     flatMap(() => this.loadFirestoreList('colecciones')),
    //     tap(() => console.log( 'colecciones loaded', )),
    //     tap(() => {
    //       this._loading.toggleWaitingSpinner('close')
    //       console.groupEnd()
    //       this._alerts.sendFloatNotification('Agente cargado')
    //       this.loaded$.next(true)
    //       console.log( 'loaded' )
    //       return true
    //     })
    //   )
  }

  // }

  currentPath(functionName?: string) {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'clientId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, functionName )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, functionName )
    } else {
      return `usuarios/${clientId}/agentes/${ projectId }`
    }
  }
  // # GET PATH
  /** Obtiene la ruta del agente en curso, espera por la respuesta del auth service para obtener el usuario */
  // getPath(): Observable<string> {
  //   let user = this._cache.getDataKey<firebase.User>( 'user' );
  //   if ( user ) {
  //     this.path = `usuarios/${user.uid}/agentes/${this.projectId}`;
  //     this._cache.updateData('agentePath', this.path)
  //     return of( this.path );

  //   }
  // }
  // private loadFirestoreList(collection: string) {
  //   return this.fs

  // /** Función para la ruta en común de llamdas a firestore para cargar las listas del agente */
  //     .collection(`${this.path}/${collection}`)
  //     .valueChanges()
  //     .pipe(
  //       tap((list) => {
  //         // console.log( collection + "success" )
  //         this._cache.updateData(collection, list);
  //       })
  //     );
  // }

  /** Establece los observables para las listas del agente desde el caché */
  // private setObservables(collection: string):Observable<any> {
  //   return this._cache
  //     .listenForChanges<MensajeModel[]>(collection)
  //     .pipe(filter((list) => !!list));
  // }


  // SECTION INTENTS


  /** Se desuscribe de la list de intents */
  // unsubscribeIntentList() {
  //   // this.intentListSubs.unsubscribe();
  //   this.intentList$ = new Observable();
  //   this._cache.deleteDataKey('intents');
  // }



  // !SECTION

  // contextosList: ContextoModel[] = [];
  // contextosSubs: Subscription;
  // /** GET CONTEXT LIST Retorna la lista de Contextos del agente */
  // getContextosList(): Observable<iContext[]> {
  //   this.contextosList$ = this._cache
  //     .listenForChanges<iContext[]>('contextos')
  //     .pipe(filter((mensajes) => !!mensajes));

  //   return this.fs
  //     .collection<iContext>(`${this.path}/contextos`)
  //     .valueChanges()
  //     .pipe(
  //       tap((list) => {
  //         this._cache.updateData('contextos', list);
  //       })
  //     );
  // }


  // tarjetasList: TarjetaModel[];
  // tarjetasSubs: Subscription;
  // async getTarjetasList() {
  //   const path = `usuarios/${this.usuario.uid}/tarjetas`;
  //   var changes = this.fs.collection<TarjetaModel>(path).valueChanges();
  //   this.tarjetasSubs = changes.subscribe((list) => {
  //     this._cache.updateData('tarjetas', list);
  //   });
  //   this.tarjetasList$ = this._cache.listenForChanges<TarjetaModel[]>(
  //     'tarjetas'
  //   );
  //   this.tarjetasList = await this._cache.getAsyncKey('tarjetas', 2);
  // }

  // /** Lista de colecciones*/
  // coleccionesList: ColeccionModel[];
  // coleccionesSubs: Subscription;
  // /** Se suscribe a las colecciones en Firestore y las retorna como promesa
  //  * @return {*}  {Promise<ColeccionModel[]>}
  //  */
  // async getColeccionesList(): Promise<ColeccionModel[]> {
  //   const path = `usuarios/${this.usuario.uid}/colecciones`;
  //   this.contextosSubs = this.fs
  //     .collection<ColeccionModel>(path)
  //     .valueChanges()
  //     .subscribe((list) => this._cache.updateData('colecciones', list));
  //   this.coleccionesList$ = this._cache.listenForChanges<ColeccionModel[]>(
  //     'colecciones'
  //   );
  //   this.coleccionesList = await this._cache.getAsyncKey<ColeccionModel[]>(
  //     'colecciones',
  //     2
  //   );

  //   return this.coleccionesList;
  // }

  /** CLEAN TEST CHAT: Limpia la sesión de conversación para TestChat del agente */
  cleanTestChat() {
    let clientId = this._cache.getDataKey('clientId');
    const path = `usuarios/${clientId}/clientes/TEST`;
    this._afs.doc(path).update({
      outputContexts: firebase.firestore.FieldValue.delete(),
      sessionId: firebase.firestore.FieldValue.delete(),
      sessionParams: firebase.firestore.FieldValue.delete(),
    });
  }
}
