import { Injectable } from '@angular/core';
import { AgenteModel } from '../init-agente/agente.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserInterface } from '../../../../admin/auth/auth.service';
import { GdevCache } from '../../../../gdev-tools/src/lib/cache/gdev-cache.service';
import { Subject, Observable, Subscription, of } from 'rxjs';
import { filter, tap, map, flatMap, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IntentModel,  MensajeModel } from './mensajes/mensaje.model';
import { ContextoModel } from './contextos/contexto.model';
import { ColeccionModel } from '../../colecciones/collection.interface';
import { TarjetaModel } from '../../tarjetas/tarjeta.model';
import { HttpClient } from '@angular/common/http';
import { GdevAlert } from '../../../../gdev-tools/src/lib/alert/alert.service';
import { GdevLoading } from '../../../../gdev-tools/src/lib/loading/loading.service';
import { environment } from '../../../../../environments/environment';
import firebase from 'firebase/app'
import { AgentesService } from '../agentes.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { TiposService } from './tipos/tipos.service';
import { MensajesService } from './mensajes/mensajes.service';
import { ContextosService } from './contextos/contextos.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentAgenteService {
  // SECTION CURRENT AGENTE

  // # CURRENT AGENT
  /** Estado presente del agente actual */
  public current: AgenteModel;
  // # PROJECT ID
  /** Almacena el ID de projecto actual */
  public projectId: string;
  // # PATH
  /** Almacena la ruta actual del agente actual del usuario actual */
  public path: string;
  // # USER
  /** Almacena la información del usuario actual */
  public usuario: UserInterface;
  // # AGENTE LOADED
  /** Escucha cuando el agente termina de ser cargado */
  public loaded$: Subject<boolean> = new Subject();
  /** Número de veces que se ha recargado el agente */
  private loads = 0;
  /** Almacena la URL del API */
  private _url = environment.restURL + 'intent';

  intentList$: Observable<IntentModel[]>;
  firestoreIntentList$: Observable<MensajeModel[]>
  contextosList$: Observable<ContextoModel[]>;
  // tiposList$: Observable<(TipoEntidadModel | SystemEntitieModel)[]>;
  tarjetasList$: Observable<TarjetaModel[]>
  coleccionesList$: Observable<ColeccionModel[]>


  constructor(
    private fs: AngularFirestore,
    private _cache: GdevCache,
    private router: Router,
    private _http: HttpClient,
    private _alerts: GdevAlert,
    private _loading: GdevLoading,
    private _contexts: ContextosService,
    private _agentes: AgentesService,
    private _dashboard: DashboardService,
    private _mensajes: MensajesService,
    private _tipos: TiposService
  ) {

    this.firestoreIntentList$ = this.setObservables('mensajes')
    this.contextosList$ = this.setObservables('contextos')
    // this.tiposList$ = this.setObservables('tipos')
    this.tarjetasList$ = this.setObservables('taretas')
    this.coleccionesList$ = this.setObservables('colecciones')

  }

  async setCurrentAgente(projectId: string) {
    // this._loading.toggleWaitingSpinner('open')
    this.projectId = projectId;
    this._cache.updateData('projectId', projectId);
    this.current = await this._agentes.loadOneAgente(projectId);
    this._cache.updateData('currentAgente', this.current);
    return this._dashboard.initializeDashboard()
      .pipe(
        tap(() => {
          console.group('init')
          this._loading.toggleWaitingSpinner('open')
        }),
        flatMap(() => this.getPath()),
        distinctUntilChanged(),
        tap(() => console.log( 'path loaded', )),
        flatMap(() => this.loadFirestoreList('mensajes')),
        tap(() => console.log( 'mensajes loaded', )),
        flatMap(() => this._contexts.getAllContexts()),
        tap(() => console.log( 'context loaded', )),
        flatMap(() => this._mensajes.getDialogFlowIntents()),
        tap(() => console.log( 'intent loaded', )),
        flatMap(() => this._tipos.getTiposList()),
        tap(() => console.log( 'tipos loaded', )),
        flatMap(() => this.loadFirestoreList('tarjetas')),
        tap(() => console.log( 'tarjetas loaded', )),
        flatMap(() => this.loadFirestoreList('colecciones')),
        tap(() => console.log( 'colecciones loaded', )),
        tap(() => {
          this._loading.toggleWaitingSpinner('close')
          console.groupEnd()
          this._alerts.sendFloatNotification('Agente cargado')
          this.loaded$.next(true)
          console.log( 'loaded' )
          return true
        })
      )
  }

  // }

  // # GET PATH
  /** Obtiene la ruta del agente en curso, espera por la respuesta del auth service para obtener el usuario */
  getPath(): Observable<string> {
    let user = this._cache.getDataKey<UserInterface>('user');
    this.path = `usuarios/${user.uid}/agentes/${this.projectId}`;
    this._cache.updateData('agentePath', this.path)
    return of( this.path );
    // this.projectId = await this._cache.getAsyncKey<string>('projectId');
  }
  private loadFirestoreList(collection: string) {
    return this.fs

  /** Función para la ruta en común de llamdas a firestore para cargar las listas del agente */
      .collection(`${this.path}/${collection}`)
      .valueChanges()
      .pipe(
        tap((list) => {
          // console.log( collection + "success" )
          this._cache.updateData(collection, list);
        })
      );
  }

  /** Establece los observables para las listas del agente desde el caché */
  private setObservables(collection: string):Observable<any> {
    return this._cache
      .listenForChanges<MensajeModel[]>(collection)
      .pipe(filter((list) => !!list));
  }


  // SECTION INTENTS


  /** Se desuscribe de la list de intents */
  unsubscribeIntentList() {
    // this.intentListSubs.unsubscribe();
    this.intentList$ = new Observable();
    this._cache.deleteDataKey('intents');
  }



  // !SECTION

  // contextosList: ContextoModel[] = [];
  contextosSubs: Subscription;
  /** GET CONTEXT LIST Retorna la lista de Contextos del agente */
  getContextosList(): Observable<ContextoModel[]> {
    this.contextosList$ = this._cache
      .listenForChanges<ContextoModel[]>('contextos')
      .pipe(filter((mensajes) => !!mensajes));

    return this.fs
      .collection<ContextoModel>(`${this.path}/contextos`)
      .valueChanges()
      .pipe(
        tap((list) => {
          this._cache.updateData('contextos', list);
        })
      );
  }


  tarjetasList: TarjetaModel[];
  tarjetasSubs: Subscription;
  async getTarjetasList() {
    const path = `usuarios/${this.usuario.uid}/tarjetas`;
    var changes = this.fs.collection<TarjetaModel>(path).valueChanges();
    this.tarjetasSubs = changes.subscribe((list) => {
      this._cache.updateData('tarjetas', list);
    });
    this.tarjetasList$ = this._cache.listenForChanges<TarjetaModel[]>(
      'tarjetas'
    );
    this.tarjetasList = await this._cache.getAsyncKey('tarjetas', 2);
  }

  /** Lista de colecciones*/
  coleccionesList: ColeccionModel[];
  coleccionesSubs: Subscription;
  /** Se suscribe a las colecciones en Firestore y las retorna como promesa
   * @return {*}  {Promise<ColeccionModel[]>}
   */
  async getColeccionesList(): Promise<ColeccionModel[]> {
    const path = `usuarios/${this.usuario.uid}/colecciones`;
    this.contextosSubs = this.fs
      .collection<ColeccionModel>(path)
      .valueChanges()
      .subscribe((list) => this._cache.updateData('colecciones', list));
    this.coleccionesList$ = this._cache.listenForChanges<ColeccionModel[]>(
      'colecciones'
    );
    this.coleccionesList = await this._cache.getAsyncKey<ColeccionModel[]>(
      'colecciones',
      2
    );

    return this.coleccionesList;
  }

  /** CLEAN TEST CHAT: Limpia la sesión de conversación para TestChat del agente */
  cleanTestChat() {
    const path = `${this.path}/clientes/TEST`;
    this.fs.doc(path).update({
      outputContexts: firebase.firestore.FieldValue.delete(),
      sessionId: firebase.firestore.FieldValue.delete(),
      sessionParams: firebase.firestore.FieldValue.delete(),
    });
  }
}
