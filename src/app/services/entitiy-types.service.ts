import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference } from '@angular/fire/firestore';
import { Subject, Observable, of, zip, BehaviorSubject } from 'rxjs';
import { map, tap, flatMap, take, mergeMap, filter, scan } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { difference } from 'lodash';
import { EntityTypeModel, extractTypeId, iEntity, iEntityType, iSystemEntity } from '../models/entity-type.model';
import { MxAlert, MxCache, MxColor, MxErrorAlertModel, MxLoading, MxText } from '@marxa/devkit';
import { SystemEntitiesService } from '../admin/utils/system-entities.service';
import { CurrentEntityTypeService } from './current-entity-type.service';
import { iContext } from '../models/context.model';
import { CommonsService } from '../shared/commons.service';
import { iParameter } from '../models/intent.model';
import { from } from 'rxjs';
import { ContextsService } from './contexts.service';

@Injectable({
  providedIn: 'root',
})
export class EntityTypesService {
  /** Almacena la ruta del proyecto actual a la collection de tipos  */
  // private tiposPath: string;
  /** Almacena la ruta a los intent */
  // private agentePath: string;
  /** Obtine y almacena la ruta a la API */
  private _url = environment.restURL + '/entity';
  /** Almacena el id del proyecto del caché */
  // private projectId: String;
/** Lista observable de los tipos */
  public list$ = new BehaviorSubject<iEntityType[]>([]);

  // private listSubs: Subscription;

  constructor(
    private _loading: MxLoading,
    private _afs: AngularFirestore,
    private _cache: MxCache,
    private _text: MxText,
    private _http: HttpClient,
    private _alerts: MxAlert,
    private _color: MxColor,
    private _common: CommonsService,
    private _contexts: ContextsService,
    private _systemEntites: SystemEntitiesService,
    private _currentEntityType: CurrentEntityTypeService
  ) {
    this.listen().subscribe(this.list$)
  }

  projectPath(functionName?: string, project?: string) {
    const projectId = project || this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'userId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`,
      `entityTypes.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`,
      `entityTypes.service#${functionName}` )
    } else {
      return `usuarios/${clientId}/agentes/${ projectId }`
    }
  }

  // CREATE TIPOS DE DATOS

  // # $CREATE TIPO
  /** Prepara la entity para ser creada en el backend, obtiene el ID:name y guarda los datos en firestore */
  public async create(
    displayName: string,
    projectId?: string,
  ): Promise<iEntityType | undefined> {

    const entityType = new EntityTypeModel(this._text.normalize( displayName ))
    const typeList = this.list$.value
    const typesPath = `${this.projectPath('create', projectId)}/entityTypes`
    const typeInList = typeList.find(
      (t) => t.displayName === entityType.displayName
    );

    // Prepare entityType


    this._loading.toggleWaiting( 'open' );

    if (!typeInList) {
      // create entity API
      let newEntity = await this._postCreateEntity({ ...entityType }, projectId);
      // Get clean entity Id
      const resourceID = extractTypeId(newEntity.name as string)
      const typeToAdd:iEntityType = { ...entityType, name: newEntity.name };

      // Save tipo in firestore
      await this._afs.collection(typesPath).doc(resourceID).set(typeToAdd);
      this._loading.toggleWaiting('close');
      return typeToAdd;
    } else {
      this._alerts.message( 'No es posible crear entidades duplicadas' );
      return
    }
  }

  /** Crea el entity en el backend */
  private _postCreateEntity(
    entityType: EntityTypeModel,
    project?: string
  ): Promise<iEntityType> {
    const projectId = project || this._cache.getDataKey<string>( 'projectId' )
    if (!projectId) throw new MxErrorAlertModel(`No se encontró el projectId`)

    return new Promise( ( resolve, reject ) => {
      this._http.post(
          `${this._url}/${projectId}`,
          { entityType: { ...entityType } },
          { responseType: 'json' }
      ).pipe( take( 1 ) ).toPromise()
        .then( (response: any) => {
          resolve( response['result'] );
        })
        .catch((err) => {
          if (err) {
            console.error(err);
            this._loading.toggleWaiting('close');
            this._alerts.error(
              'No fué posible crear ese Tipo en este momento. Intentelo de nuevo porfavor.',
              err
            );
            this.closeCreateDialog.next();
          }
          reject(err);
        });
    });
  }

  // # CLOSE "CREATE DIALOG"
  /** Escucha cunado el Dialog de creado de entity es cerrado */
  public closeCreateDialog: Subject<any> = new Subject();


  async putEntityOnType(displayName: string, entity: iEntity) {
    try {
      console.log( displayName )
      displayName = displayName.split('@').length > 1
        ? displayName.split('@')[1] : displayName;

      const list = this.list$.value
      const entityType = list.find(t => t.displayName === displayName)
      if ( entityType ) {

        const entityInList = entityType.entities.find(e => e.value === entity.value)
        console.log(entityInList)

        if (!entityInList) {
          if (!entityType.entities) entityType.entities = []
          entityType.entities.push(entity)
          await this._currentEntityType.updateTipo( entityType )
          return entityType
        } else {
          if ( entityInList.synonyms ) {
            const synonyms = difference( entity.synonyms, entityInList.synonyms)
            console.log( synonyms )
            if ( synonyms.length > 0 ) {
              entityInList.synonyms = [ ...entityInList.synonyms, ...synonyms ]
            }
          }

          entityType.entities = [...entityType.entities, entityInList]
          console.log( entityType )
          await this._currentEntityType.updateTipo(entityType)
          return entityType
        }
      } else {
        throw new MxErrorAlertModel( `No se encontró el tipo de dato al que quieres agregar esta entidad`, 'tipos.service#putEntityOnType')
      }

    } catch ( error: any ) {
      if ( 'message' in error ) {
        this._alerts.error( error.message, error)
      } else {
        this._alerts.error('Error', error)
      }
      return console.error(error)
    }
  }






  // REVIEW Probablemente no lo necesitemos
  async createTipoContextos(entityType: EntityTypeModel) {
    this._loading.toggleWaiting( 'open' );
    const path = `${this.projectPath('createContextEntityType')}/entityTypes`
    entityType.displayName = this._text.normalize(entityType.displayName);
    Object.keys(entityType).forEach((key) => {
      if ( entityType[ key as keyof EntityTypeModel ] == undefined )
        delete entityType[ key as keyof EntityTypeModel ];
    });

    let newEntity = await this._postCreateEntity({ ...entityType });
    console.log(newEntity);
    const resourceID = extractTypeId(newEntity.name as string);

    const newTipo = { ...entityType, name: newEntity.name };
    await this._afs.collection(path).doc(resourceID).set(newTipo);

    // create contexts
    await this._loading.asyncForEach(
      newEntity.entities,
      async ( entity, index ) => {
        this._contexts.set(entity.value, index)
      }
    );

    this._loading.toggleWaiting('close');
  }


  // $READ TIPOS DE DATOS
  /** GET TIPOS LIST Retorna la lista completa de entidades del agente y las entidades de sistema */
  listen(): Observable<iEntityType[]> {
    const path = `${ this.projectPath( 'entityTypes#listen' ) }/entityTypes`
    return this._afs.collection<iEntityType>( path )
      .valueChanges()
  }


  // # GET ALL ENTITIES From backend
  /** Toma entities del backend */
  public getAllEntities(): Observable<any> {
    let projectId = this._cache.getDataKey( 'projectId' )
    let fsPath = `${this.projectPath('getAllEntities')}/entityTypes`
    return this._http.get(`${this._url}/${projectId}`)
      .pipe(
        map((response: any) => {
          if (response['status'] === "Success")
            return response['result']
          else console.error("Error al cargar los entityTypes")
        }),
        tap((list: iEntityType[]) => {
          list.forEach(t => {
            let tipoId = extractTypeId(t.name as string)
            this._afs.collection(fsPath).doc(tipoId).set(t, {merge: true})
          })
        })
      )
  }


  // # GET BY NAME
  /** Toma una entity basado en el name */
  public async getByName( name: string ) {
    let path = `${ this.projectPath( 'getByName' ) }/entityTypes`
    let doc = await this._afs.collection<EntityTypeModel>(path).ref.doc(name).get()
    return doc.exists ? doc.data() : null
  }

  // # GET BY DISPLAYNAME
  /** Toma una entity basado en el displayName */
  public async getByDisplayName(displayName: string) {
    let path = `${ this.projectPath( 'getByName' ) }/entityTypes`
    let result = await this._afs.collection<EntityTypeModel>( path ).ref
      .where('displayName', '==', displayName).get()
    return result.empty ? null : result.docs[0].data()
  }



  filterByParams( paramList: iParameter[] )
    : Observable<( EntityTypeModel | iSystemEntity )[]> {
    const sysTypes: any = this._systemEntites.systemEntities
    const allTypes = this.listen().pipe(
      map<EntityTypeModel[], ( EntityTypeModel | iSystemEntity )[]>(
        types => types.concat( sysTypes )
      )
    )

    return from( paramList ).pipe(
      mergeMap( param => {
        let splited = param.entityTypeDisplayName.split( '@' )
        let paramEntity = splited[ 1 ] ? splited[ 1 ] : splited[ 0 ]
        return allTypes.pipe( map( types =>
          types.find( t => t.displayName === paramEntity)
        ))
      } ),
      scan( ( acc, val ) => {
        if ( val !== undefined ) acc.push( val )
        return acc
      }, <( EntityTypeModel | iSystemEntity )[]>[] )
    )
  }

  /** Está pendiendte de la entity seleccionada en el storage */
  // getCurrentTipo$() {
  //   return this.store.select('tipos').pipe(
  //     map((tipos) => {
  //       // console.log(tipos);
  //       let selected = tipos.find((t) => t.selected == true);
  //       return selected;
  //     })
  //   );
  // }

  /** Regresa como promesa la entity que se abrió en el panel. Se suscribe en tipo.compoenent.ts */
  // getCurrentTipo() {
  //   this.currentTipoSubs = this.getCurrentTipo$().subscribe(this.currentTipo$);
  // }



  /** Elimina la entity en el backend */
  private _deleteEntityType( entityId: string ): Promise<any> {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const projectPath = `${this._url}/${projectId}/${entityId}`
    return new Promise((resolve, reject) => {

      console.log({ projectId: projectId, entityId });

      this._http.delete(projectPath).toPromise().then(() => {
          resolve('done');
        }).catch((err) => {
          if (err) {
            let error = err.error.error;
            console.log(error);
            if (error.code === 3) {
              this._alerts.message(
                'Este tipo de datos es usado en el flujo, no puede ser eliminado'
              );
            } else {
              this._alerts.error(
                'No es posible elimnar intent, error desconocido.',
                err
              );
            }
          }
          reject(err);
        });
    });
  }

  // # DETELTE ENTITY TYPE
  /** Elimina la entity en firestore y backend */
  async deleteTipo(tipoName: string) {
    this._loading.toggleWaiting( 'open' );
    let path = `${ this.projectPath( 'getByName' ) }/entityTypes`
    const currentId = tipoName.slice(tipoName.lastIndexOf('/') + 1);
    await this._deleteEntityType(currentId);
    await this._afs.collection(path).doc(currentId).delete();
    this._alerts.notify('Exito elimando ese tipo de dato.');
    this._loading.toggleWaiting('close');
    return;
  }



  unsubscribe() {
    // this.currentTipoSubs.unsubscribe();
    // this.listSubs.unsubscribe();
  }
}
