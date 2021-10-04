import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MxAlert, MxCache, MxCommonsService, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinct, map, mergeMap, take, tap } from 'rxjs/operators';
import { ResponseModel } from '../models/response.model';
// import { ResponseModel, IntentResponseResult } from '../models/intent-response.model';
import { CurrentIntentService } from './current-intent.service';

@Injectable({
  providedIn: 'root',
})
export class ResponsesService {

  // tarjetasList: TarjetaModel[];
  /** El mensae en curso de edición */
  // currentMensaje: IntentModel;
  /** El id de mensaje en curso para consultas */
  // currentMensajeName: string;

  /** Observable de la lista de respuestas */
  // respuestasList: RespuestaModel[];
  /** Observable de las respuestas cuando se agregó, editó o eliminó alguna respuesta */
  onResponsesChanged: Subject<any> = new Subject();


  /** Lista de tipos de respuesta
   * @variation `texto` para respuestas de sólo texto.
   * @variation `sugerencias` para crear un arreglo de sugerencias
   * @variation `card` para usar una tarjeta de imagen, texto, título y botones
   * @type {EstiloResp[]}
   * @memberof RespuestasService
   */
  estiloResps: EstiloResp[] = [
    { name: 'texto', display: 'Texto' },
    { name: 'suggests', display: 'Sugerencias' },
    // { name: 'card', display: 'Tarjeta' },
  ];

  emptyResponse?: ResponseModel

  public list$: Observable<ResponseModel[]>

  constructor(
    private _afs: AngularFirestore,
    private _loading: MxLoading,
    private _alerts: MxAlert,
    private _cache: MxCache,
    private _commons: MxCommonsService,
  ) {
    this.list$ = this.listen$()
  }

  intentPath(functionName?: string): string {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'userId' )
    const intentId = this._cache.getDataKey<string>( 'intentId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, `responses.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `responses.service#${functionName}` )
    } else {

      return `usuarios/${clientId}/agentes/${ projectId }/intents/${intentId}`
    }
  }


  listen$() {
    return this._cache.listenForChanges<string>( 'intentId' ).pipe(
      distinct(),
      mergeMap( ( intentId => {
        console.log( intentId )
        const path = `${ this.intentPath( 'list' ) }/responses`
        return this._afs.collection( path ).valueChanges( { idField: 'id' } )
        .pipe( map((respuestas) =>
          this._commons.sortBy<ResponseModel>( respuestas, 'index' ) ),
          tap( responses => {
            console.log( responses )
            return responses
          })
        )
      }))
    )
  }

  async getList() {
    return await this.list$.pipe( take( 1 ) ).toPromise()
  }


  /**
   * Agrega o actualiza respuestas al mensaje en curso en FIRESTORE
   *
   * @param {ResponseModel} respuesta - El objeto de respuesta
   * @return {Subject} Aviso al observable de cambios en la lista de respuestas
   */
  async set( respuesta: ResponseModel ) {
    const intentPath = `${ this.intentPath( 'set' ) }`
    const intentRef = this._afs.doc( intentPath)
    if (respuesta.id) {
      console.log('update');

      for (let [key, value] of Object.entries(respuesta)) {
        if (key === undefined) delete respuesta[key];
      }

      intentRef.collection('responses')
        .doc(respuesta.id)
        .set(respuesta, { merge: true });
      this._alerts.notify('Respuesta actualizada');
    } else {
      console.log('create');

      // if ( respuesta.tipo &&
      //   respuesta.tipo != 'conditional' &&
      //   (await this.checkKindResponses(respuesta.tipo) > 1)
      // ) {
      //   this._alerts.message(
      //     'No puedes agregar más de una respuesta de tipo ' + respuesta.tipo
      //   );
      // } else {
        console.log(respuesta);
        // Object.keys(respuesta).forEach(key => { if (respuesta[key] == undefined) delete respuesta[key]})
        // Object.keys(respuesta.result).forEach(key => { if (respuesta.result[key] == undefined) delete respuesta.result[key]})
        for (let [key, value] of Object.entries(respuesta)) {
          console.log(respuesta[key as keyof ResponseModel]);
          if (respuesta[key as keyof ResponseModel] === undefined) delete respuesta[key as keyof ResponseModel];
        }
        let result = respuesta.result;
        // for (let [key, value] of Object.entries(result)) {
        //   console.log(result[key as keyof IntentResponseResult]);
        //   if (result[key as keyof IntentResponseResult] === undefined) delete result[key as keyof IntentResponseResult];
        // }
        respuesta.result = {...result};

        console.log( respuesta )
        let res = await intentRef.collection( 'responses' ).add( { ...respuesta } )
        await res.update({ id: res.id })
        delete this.emptyResponse
      // }
    }

    return this.onResponsesChanged.next(true);
  }

  /**
   * Revisa si existe alguna respuesta del tipo seleccionado
   *
   * @param {('default' | 'catch' | 'search')} kind Tipo de respuesta. Puede ser 'default' | 'catch' | 'search'
   * @return {number} Cantidad de veces que existe el tipo de respuesta
   */
  async checkKindResponses(
    kind: 'default' | 'catch' | 'search' | 'suggests'
  ) {
    var resCant: boolean[] = [];
    const list = await this.getList();
    await this._loading.asyncForEach(
      list, (res: ResponseModel) => {
        // if ( res.tipo == kind )
          resCant.push( true );
      }
    );
    return resCant.length;
  }

  /**
   * Elimina la respuesta seleccionada
   *
   * @param {string} respuestaId - El id de la respuesta a borrar
   * @return {Subject} Aviso al observable de cambios en la lista de respuestas
   */
  async delRespuesta( respuestaId: string ) {
    const intentPath = `${ this.intentPath( 'delRespuesta' ) }`
    const intentRef = this._afs.doc( intentPath)
    try {
      await intentRef.collection('responses').doc(respuestaId).delete();

      return this.onResponsesChanged.next(true);
    } catch (error) {
      console.error(error);
      this._alerts.error('No se pudo eliminar', error);
    }
  }


  async updateRespuestasOrder( list: ResponseModel[] ) {
    const intentPath = `${ this.intentPath( 'updateRespuestasOrder' ) }`
    const intentRef = this._afs.doc( intentPath)
    const respRef = intentRef.collection('responses').ref
    const batch = this._afs.firestore.batch()

    await this._loading.asyncForEach(list, (r, i) => {
      r.index = i
      batch.update(respRef.doc(r.id), {...r})
      return r
    })

    return batch.commit()

  }
}

/**
 * Interface para el arreglo de los estilos de respuestas
 *
 * @export
 * @interface EstiloResp
 */
export interface EstiloResp {
  name: string;
  display: string;
}
