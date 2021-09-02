import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { EntityTypeStateModel, extractTypeId, iEntity, iEntityType } from '../models/entity-type.model';

@Injectable({
  providedIn: 'root'
})
export class CurrentEntityTypeService {

  /** Estado en tiempo real del Tipo de dato seleccionado */
  current$ = new BehaviorSubject<EntityTypeStateModel|null>(null);
  /** Obtine y almacena la ruta a la API */
  private _url = environment.restURL + 'entity';
  /** Tipo de dato que será activado */
  activatedToEdit?: string
  /** Activa el campo de agregado de clase */
  switchAddClase: boolean = false

  constructor(
    private _cache: MxCache,
    private _loading: MxLoading,
    private _afs: AngularFirestore,
    private _alerts: MxAlert,
    private _http: HttpClient
  ) {
  }

  /** Obtiene la ruta a la colección de firestore */
  get tiposPath() {
    let agentePath = this._cache.getDataKey('agentePath');
    return `${agentePath}/entityTypes`;
  }

  /** Define el tipo de dato seleccionado */
  setCurrentTipo(entityType: EntityTypeStateModel) {
    entityType.saved = true
    this.current$.next(entityType)
    return this.current$.pipe(
      startWith(entityType),
      distinctUntilChanged((x,y) => JSON.stringify(x) === JSON.stringify(y))
    )
  }

  /** Establece el estado del botón de guardado como guardado */
  async onSave() {
    const entityType = this.current$.getValue()
    if ( !entityType ) {
      throw new MxErrorAlertModel( `No se encontró el tipo`,)
    } else {
      await this.updateTipo( entityType.body )
      this.current$.next( { ...entityType, saved: true })
      return this._alerts.notify('Actualizado')
    }
  }

  // # UPDATE TIPO
  /** Prepara la entity para ser actualizada en el backend y posterior lo guarda en Firestore */
  public async updateTipo(tipo: iEntityType) {
    // GdevLoading animation
    this._loading.toggleWaiting('open');

    console.log(tipo);
    // clean object
    Object.keys(tipo).forEach((key) => {
      if ( tipo[ key as keyof iEntityType ] == undefined )
        delete tipo[ key as keyof iEntityType ];
    });

    await this._putEntityRequest(tipo);
    const resourceID = extractTypeId(tipo.name as string)
    console.log(resourceID);

    this._afs
      .collection(this.tiposPath)
      .doc(resourceID)
      .set(tipo, { merge: true });

    this._loading.toggleWaiting('close');

    return tipo.name;
  }

  /** Actualiza la Entity en el backend */
  private _putEntityRequest(entityType: iEntityType) {
    return new Promise((resolve, reject) => {
      this._http
        .put(this._url, { entityType: entityType })
        .toPromise()
        .then((result) => {
          console.info('Entity updated', result);
          this._alerts.notify('Tipo guardado');
          resolve(true);
        })
        .catch((err) => {
          if (err) {
            console.error(err);
            this._loading.toggleWaiting('close');
            this._alerts.error(
              'No fué posible crear ese Tipo en este momento.',
              err
            );
          }
          reject(err);
        });
    });
  }

  /** Edita el DisplayName del tipo de dato en la memoria */
  editDisplayName( displayName: string ) {
    if(this.current$.value) {
      this.current$.next({
        ...this.current$.value,
        saved: false,
        body: {
          ...this.current$.value.body,
          displayName
        }
      } )
    }
  }


  /** Obtiene la clase que solicita */
  getClase(name?: string): iEntity  {
    const entityType = this.current$.getValue()

    try {
      if ( entityType ) {
        if ( name || entityType.body.entities) {
          let entityFinded = entityType.body.entities.find( e => e.value == name )
          if ( entityFinded ) return entityFinded

          else throw new MxErrorAlertModel( `No se pudo encontrar la entidad ${ name }` )

        } else throw new MxErrorAlertModel('No obtuvo el name del entity o no se encontraron entities en la entityType actual')

      } else throw new MxErrorAlertModel( 'No se estableció entity type actual' )

    } catch (error) {
      if ('message' in error) {
        this._alerts.error(error.message, error, 'current-entity-type.service#getEntity')
      } else {
        this._alerts.error(`Error buscando el entity ${name}`, error, 'current-entity-type.service#getEntity')
      }
      // return console.error(error)
      throw console.error(error)
    }
  }


  /** Agrega una clase a la entity seleccionada por nombre */
  async setClase(clase: iEntity) {
    try {
      var current = this.current$.value
      if ( current ) {
        if (current.body.entities && current.body.entities.length > 0) {
          var clasesList = current.body.entities;
          var claseIndex = clasesList.findIndex((cla) => cla.value === clase.value);
          console.log({ claseIndex });

          if (claseIndex >= 0) {
            clasesList = [
              ...clasesList.slice(0, claseIndex),
              clase,
              ...clasesList.slice(claseIndex + 1),
            ];
          } else {
            clasesList = [...clasesList, clase];
          }

          current = {
            ...current,
            saved: false,
            body: {
              ...current.body,
              entities: clasesList
            }
          };
          this.current$.next(current);
        } else {
          current.body.entities = [clase]
          current.saved = false
          this.current$.next(current);
        }

        return;
      } else throw new MxErrorAlertModel( `No se tiene la entityType actual`)
    } catch (error) {
      if ('message' in error) {
        this._alerts.error(error.message, error)
      } else {
        this._alerts.error(``, error)
      }
      return console.error(error)
    }
  }

  /** Agrega sinónimos a la entity actual */
  async setSinonimo(
  clase: iEntity,
  sinonimo: string,
  action: 'add' | 'del'
  ) {

    // Obtener los datos actuales
    var current = this.current$.getValue()

    try {
      if ( current ) {
        var clasesList: iEntity[] = current.body.entities;
        var claseIndex = clasesList.findIndex((c) => c.value === clase.value);

        // Si no existe la clase, se agrega a la lista actual
        if (claseIndex < 0) {
          clase['synonyms'] = [];
          clasesList = [...clasesList, clase];
        }

        let entity = clasesList.find( c => c.value === clase.value );
        // Agrega o elimina el sinónimo
        if ( entity ) {
          if ( action == 'add' ) {
            if ( !entity.synonyms ) entity.synonyms = []
            entity.synonyms.push( sinonimo )
          } else {
            if ( entity.synonyms ) {
              let synIndex = entity.synonyms.indexOf( sinonimo )
              if (synIndex > -1) entity.synonyms.splice( synIndex, 1)
            }
          }
        }

        // Actualiza el Tipo de dato seleccionado y lo regresa al estado
        current = {
          ...current,
          saved: false,
          body: {
            ...current.body,
            entities: clasesList
          }
        };
        this.current$.next(current);
        return;
      }
    } catch (error) {
      if ('message' in error) {
        this._alerts.error(error.message, error)
      } else {
        this._alerts.error(``, error)
      }
      return console.error(error)
    }
  }


  async deleteClase( claseValue: string) {
    try {
      var current = this.current$.getValue()
      if ( current ) {
        var clasesList = current.body.entities;
        var claseIndex = clasesList.findIndex(
          (clase) => clase.value === claseValue
        );

        if (claseIndex >= 0) {
          clasesList = clasesList.filter((c) => c.value != claseValue);
        }

        current = {
          ...current,
          saved: false,
          body: {
            ...current.body,
            entities: clasesList
          }
        };
        this.current$.next(current);

        return;
      }
    } catch (error) {
      if ('message' in error) {
        this._alerts.error(error.message, error)
      } else {
        this._alerts.error(``, error)
      }
      return console.error(error)
    }
  }




}
