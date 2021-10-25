import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, debounceTime, map, take, tap,  } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { MxAlert, MxCache, MxColor, MxErrorAlertModel, MxLoading, MxText } from '@marxa/devkit';
import { IntentsService } from './intents.service';
import { CurrentEntityTypeService } from './current-entity-type.service';
import { ContextModel, iContext, iContextList } from '../models/context.model';
import { extractIntentId, iDialogflowIntent, iIntentState } from '../models/intent.model';
import { EntityTypeModel, iEntityType } from '../models/entity-type.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AgentsService } from './agents.service';
import { of } from 'rxjs';
import firebase from 'firebase/app'

@Injectable({
  providedIn: 'root',
})
export class ContextsService {

  private _url = environment.restURL;
  list$:Observable<iContext[]>

  constructor(
    private _afs: AngularFirestore,
    private _alerts: MxAlert,
    private _cache: MxCache,
    private _color: MxColor,
    private _http: HttpClient,
    private _intents: IntentsService,
    private _loading: MxLoading,
    private _text: MxText,
    private _tipo: CurrentEntityTypeService,
  ) {
    this.list$ = this.listen$()
  }

  projectPath(functionName?: string) {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'userId' )

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

  async set( name: string, index?: number, id?: string,): Promise<void> {
    try {
      const list = await this.list$.pipe( take(1) ).toPromise()
      const contextsRef = this._afs.collection<iContext>(
        `${ this.projectPath('set') }/contexts`
      )

      // Contexto nuevo
      if (!id) {
        let contextFinded = list.find(
          (context) => context.name === name
        );

        console.log(contextFinded);

        // Agrega contexto nuevo
        if ( !contextFinded ) {
          let context = new ContextModel(name, index)

          let contextAdded = await contextsRef.add( context );
          contextAdded.update({ id: contextAdded.id });
          context.id = contextAdded.id;
          // await this._intents.setContextIntent( name );
          return
        } else {
          this._alerts.message('Contexto duplicado');
        }


      // Actualiza contexto
      } else {
        contextsRef.doc(id).update( {id, name, index} );
        return
      }

      return
    } catch (error) {
      this._alerts.error('Error al crear el nuevo contexto', error);
      return console.error(error);
    }
  }


  async getById( contextId: string ) {
    const contextsRef = this._afs.collection<iContext>(
      `${ this.projectPath('getById') }/contexts`
    )
    const contextDoc = await contextsRef.ref.doc(contextId).get();
    var contextGeted: iContext = contextDoc.data() as iContext;
    return contextGeted;
  }

  // READ ALL


  /** Se suscribe para optener todos los contexto del agente en curso */
  // private subscribeAllContext: Subscription;

  /** Escucha todos los contextos en tiempo real */
  listen$(): Observable<iContext[]> {
    const batch = this._afs.firestore.batch()
    const path = `${ this.projectPath( 'list$' ) }/contexts`
    return this._afs.collection<iContext>(path,
      ref => ref.orderBy('index', 'asc')
    ).valueChanges({ idField: 'id'}).pipe(
      catchError( error => {
        this._alerts.error( 'No se pudieron obtener los contextos. Error de conexión con la base de datos', 'contexts.service#list$', error )
        return of([])
      })
      )
  }

  get(): Promise<iContext[]> {
    return this.list$.pipe( take( 1 ) ).toPromise()
  }

  /** Se desuscribe cunado la vista de contextos no está en pantalla */
  unsubscribeAllContext() {
    // this.subscribeAllContext.unsubscribe()
  }

  // UPDATE Index

  /** Actualiza el orden de los contextos en la vista de contextos */
  async updateIndex( contextos: iContext[] ) {
    try {
      const contextsRef = this._afs.collection<iContext>(
        `${ this.projectPath('updateIndex') }/contexts`
      ).ref
      const batch = this._afs.firestore.batch()
      await this._loading.asyncForEach(contextos,
        async ({ id, index }) => {
        batch.update(contextsRef.doc(id),{index});
      });
      await batch.commit()
    } catch (error: any) {
      if ('message' in error) {
        this._alerts.error(error.message, error)
      } else {
        this._alerts.error(`No se pudo actualizar el orden de los contextos`, error)
      }
      return console.error(error)
    }
  }

  // DELETE

  async delete( context: iContext ) {
    const contextsRef = this._afs.collection<iContext>(
      `${ this.projectPath('delete') }/contexts`
    ).ref
    await this.deleteFromIntents(context);
    // await this.deleteContextFromIntent(context.contextName);
    await this.deleteFromEntityType(context.name);
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

  private async deleteFromEntityType(context: string) {
    const tiposList = await this._cache.getDataKey<iEntityType[]>(
      'contextos'
    ) || []
    const contextType = tiposList.find((c) => c.displayName === context);
    if (contextType) {
      contextType.entities = contextType.entities
        .filter( ( entity ) => entity.value != context )
      await this._tipo.updateTipo(contextType);
      console.log('Entities list updated');
    }
    return;
  }

  private async deleteFromIntents(context: iContext) {
    this._intents.getByContext$( context.name ).pipe(
        take( 1 ),
        map(list => list ? list : [])
      ).subscribe( ( list ) => {
        if ( list.length > 0 ) {
          this._loading.asyncForEach( list, async intentState => {

            let contextToDel = intentState.intent
              .inputContextNames.indexOf(  context.id )
            intentState.intent.inputContextNames.splice( contextToDel, 1 );

            await this._intents.update( intentState )
            return
        });

        console.log('Intents updated');
      }
    });

    return;
  }

  async setContextosList( contextName: string, list: iIntentState[] ) {
    let contextsLists = this._cache.getDataKey<iContextList>('contextosLists');
    let agentContexts = await this.get()

    if ( !contextsLists ) contextsLists = {};

    this._cache.updateData( 'contextosLists',
      { ...contextsLists, [ contextName ]: list }
    );

    Object.keys( contextsLists ).forEach( ( name ) => {
      let contexto = agentContexts.find((c) => c.name == name);
      if ( !contexto && contextsLists ) {
        console.log( `No está el contexto ${contexto}` )
        delete contextsLists[ name ];
      }
    } );
  }
}
