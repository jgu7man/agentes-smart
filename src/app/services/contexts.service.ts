import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { debounceTime, map, take,  } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { MxAlert, MxCache, MxColor, MxErrorAlertModel, MxLoading, MxText } from '@marxa/devkit';
import { IntentsService } from './intents.service';
import { TiposService } from './entitiy-types.service';
import { CurrentTipoService } from './current-entity-type.service';
import { iContext, iContextList } from '../models/context.model';
import { extractIntentId, iDialogflowIntent, iIntentState } from '../models/intent.model';
import { EntityTypeModel } from '../models/entity-type.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContextsService {
  /** Ruta de los mensajes para acciones del CRUD */
  // private contextosPath;
  /** Contexto actualizado optenido de la ruta */
  currentContexto!: string | null;
  /** Consulta de los contextos de la base de datos */
  // contextQuery$: Subject<iContext> = new Subject();
  /** Lista actualizada de los contextos en orden de aparición (index) */
  // list: iContext[];
  list$: Observable<iContext[]>;
  private currentctxSubscription: Subscription
  private _url = environment.restURL;

  constructor(
    private afs: AngularFirestore,
    private _alerts: MxAlert,
    private _cache: MxCache,
    private _color: MxColor,
    private _text: MxText,
    private _loading: MxLoading,
    private _intents: IntentsService,
    private _http: HttpClient,
    private _tipos: TiposService,
    private _tipo: CurrentTipoService,
  ) {
    // Obtiene el contexto de la ruta actual
    this.currentctxSubscription =
    this._loading.getRouteQueryParams()
      .subscribe( ( queryParams ) => {
        this.currentContexto = queryParams['contexto'];
      } );
    this.list$ = this.listen$()
  }

  projectPath(functionName?: string) {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'clientId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, `contexts.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `contexts.service#${functionName}` )
    } else {
      return `usuarios/${clientId}/agentes/${ projectId }`
    }
  }

  // SECTION CRUD de contextos

  // CREATE

  async set(context: iContext): Promise<void | iContext> {
    try {
      context.color = this._color.generateHSLcolor(50, 50);
      const list = await this.list$.pipe( take(1) ).toPromise()
      const contextName = context.contextName;
      const contextsRef = this.afs.collection<iContext>(
        `${ this.projectPath('set') }/contexts`
      )

      // Clean of undefineds
      Object.keys(context).forEach((key) => {
        if ( context[ key as keyof iContext ] == undefined )
          delete context[ key as keyof iContext];
      });

      // Contexto nuevo
      if (!context.id) {
        let contextFinded = list.find(
          (context) => context.contextName === contextName
        );

        console.log(contextFinded);

        // Agrega contexto nuevo
        if (!contextFinded) {
          context.contextName = this._text
            .normalize(context.contextName)
            .toLowerCase();

          let contextAdded = await contextsRef.add( context );
          contextAdded.update({ id: contextAdded.id });
          context.id = contextAdded.id;
          await this._intents.setContextMensaje( contextName );
          return
        } else {
          this._alerts.message('Contexto duplicado');
        }

        // Actualiza contexto
      } else {
        // Crea un nuevo contexto
        contextsRef.doc(context.id).update( context );
        return
      }

      // this._agente.getContextosList();
      return context;
    } catch (error) {
      this._alerts.error('Error al crear el nuevo contexto', error);
      return console.error(error);
    }
  }

  // READ
  /** Obtiene el contexto en curso de la session storage */
  async getCurrentContexto() {
    this.currentContexto = await this._cache.getDataKey('currentContexto');
    return this.currentContexto || '';
  }

  async getOne( contexto: iContext ) {
    const contextsRef = this.afs.collection<iContext>(
      `${ this.projectPath('setContext') }/contexts`
    )
    const contextDoc = await contextsRef.ref.doc(contexto.id).get();
    var contextGeted: iContext = contextDoc.data() as iContext;
    return contextGeted;
  }

  // READ ALL

  /** Se suscribe para optener todos los contexto del agente en curso */
  // private subscribeAllContext: Subscription;

  /** Escucha todos los contextos en tiempo real */
  listen$(): Observable<iContext[]> {
    const agentePath = `${ this.projectPath('setContext') }/contexts`
    return this.afs.collection<iContext>(agentePath,
      ref => ref.orderBy('index', 'asc')
    ).valueChanges().pipe(debounceTime(1000), )
  }

  /** Se desuscribe cunado la vista de contextos no está en pantalla */
  unsubscribeAllContext() {
    // this.subscribeAllContext.unsubscribe()
  }

  // UPDATE Index

  /** Actualiza el orden de los contextos en la vista de contextos */
  async updateIndex( contextos: iContext[] ) {
    try {
      const contextsRef = this.afs.collection<iContext>(
        `${ this.projectPath('setContext') }/contexts`
      ).ref
      const batch = this.afs.firestore.batch()
      await this._loading.asyncForEach(contextos,
        async ({ id, index }) => {
        batch.update(contextsRef.doc(id),{index});
      });
      await batch.commit()
    } catch (error) {
      if ('mensaje' in error) {
        this._alerts.error(error.message, error)
      } else {
        this._alerts.error(`No se pudo actualizar el orden de los contextos`, error)
      }
      return console.error(error)
    }
  }

  // DELETE

  async delContext( context: iContext ) {
    const contextsRef = this.afs.collection<iContext>(
      `${ this.projectPath('setContext') }/contexts`
    ).ref
    await this.deleteContextFromMensajes(context);
    // await this.deleteContextFromIntent(context.contextName);
    await this.deleteContextFromTipo(context.contextName);
    await contextsRef.doc(context.id).delete();

    console.log('Context deleted');
    return;
  }

  private deleteContextFromIntent(context: string) {
    // const intentList = this._cache.getDataKey<iDialogflowIntent[]>('intents') || []
    // const contextIntent = intentList.find(
    //   (i) => i.displayName === 'Default Context Intent'
    // );

    // contextIntent.parameters = contextIntent.parameters.map((c) => {
    //   if (c.displayName !== context) return c;
    // });

    // contextIntent.trainingPhrases = contextIntent.trainingPhrases.map((t) => {
    //   if (t.parts[0].text !== context) return t;
    // });

    // // this._currentMensaje.update(contextIntent);
    // return;
  }

  private async deleteContextFromTipo(context: string) {
    // const tiposList = await this._cache.getDataKey<EntityTypeModel[]>(
    //   'contextos'
    // ) || []
    // const contextType = tiposList.find((c) => c.displayName === context);
    // if (contextType) {
    //   contextType.entities = contextType.entities.map((entity) => {
    //     if (entity.value != context) return entity;
    //   })
    //   await this._tipo.updateTipo(contextType);
    //   console.log('Entities list updated');
    // }
    // return;
  }

  private async deleteContextFromMensajes(context: iContext) {
    const agentePath = this._cache.getDataKey('agentePath');
    var mensajesPath = agentePath + '/mensajes';
    const mensajeRef = this.afs.collection(mensajesPath).ref;

    this._intents.getByContext$( context )
      .pipe(
        take( 1 ),
        map(list => list.map(c => c.intent))
      ).subscribe( ( intents ) => {
      if (intents.length > 0) {
        intents.forEach( async ( intent: iDialogflowIntent ) => {
          let contextToDel = intent.inputContextNames.findIndex(
            (ent) => ent === context.id
          )

          intent.inputContextNames.splice( contextToDel, 1 );
          await this.updateIntent(intent);
          return
        });

        console.log('Intents updated');
      }
    });

    return;
  }

  async updateIntent(intent: iDialogflowIntent) {
    this._loading.toggleWaiting( 'open' );
    let projectId = this._cache.getDataKey('projectId');
    let intentPath = `projects/${ projectId }/agent/intents/${ intent.name }`;
    let urlPath = `${this._url}/intent`
    let firestorePath = `${this.projectPath('updateIntent')}/intents`

    try {
      // Update current mensaje
      if ( projectId ) {
        intent.name = intentPath;
        const headers = { responseType: 'json' };
        const body = { intent };
        const request = await this._http.put( urlPath, body, { headers } )
          .pipe(take(1)).toPromise()
        // console.log(request);
        if (request) {
          // console.info('Se Actualizo Intent:', request);
          let intentId = extractIntentId( intent.name )
          await this.afs.collection(firestorePath).doc(intentId).update({intent})
          return;

        } else throw new MxErrorAlertModel( `No se pudo guardar` )
      } else throw new MxErrorAlertModel(`No se ha seleccionado intent como actual`)

    } catch ( error ) {
      if ( 'message' in error )
        this._alerts.error( error.message, error );
      else
        this._alerts.error('No se pudo guardar', error);
      this._loading.toggleWaitingBar();
      return console.error(error);
    }
  }

  setContextosList(contextName: string, list: iIntentState[]) {
    let contextsLists = this._cache.getDataKey<iContextList>('contextosLists');
    let agentContexts = this._cache.getDataKey<iContext[]>('contextos') || [];

    if (!contextsLists) contextsLists = { [contextName]: list };
    else contextsLists[contextName] = list;
    Object.keys(contextsLists).forEach((name) => {
      let contexto = agentContexts.find((c) => c.contextName == name);
      if (!contexto && contextsLists) delete contextsLists[name];
    });

    this._cache.updateData('contextosLists', contextsLists);
  }
}
