import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { BehaviorSubject, Subject } from 'rxjs';
import { RespuestaModel, ResultResponse } from '../models/intent-response.model';
import { CurrentIntentService } from './current-intent.service';

@Injectable({
  providedIn: 'root',
})
export class RespuestasService {
  /** @module Respuestas */

  // tarjetasList: TarjetaModel[];
  /** El mensae en curso de edición */
  // currentMensaje: IntentModel;
  /** El id de mensaje en curso para consultas */
  // currentMensajeName: string;

  /** Observable de la lista de respuestas */
  // respuestasList: RespuestaModel[];
  /** Observable de las respuestas cuando se agregó, editó o eliminó alguna respuesta */
  onRespuestasChanged: Subject<any> = new Subject();


  /** Lista de tipos de respuesta
   * @variation `texto` para respuestas de sólo texto.
   * @variation `sugerencias` para crear un arreglo de sugerencias
   * @variation `card` para usar una tarjeta de imagen, texto, título y botones
   * @type {EstiloResp[]}
   * @memberof RespuestasService
   */
  estiloResps: EstiloResp[] = [
    { name: 'texto', display: 'Texto' },
    { name: 'sugerencias', display: 'Sugerencias' },
    // { name: 'card', display: 'Tarjeta' },
  ];

  constructor(
    private fs: AngularFirestore,
    private _mensaje: CurrentIntentService,
    private _loading: MxLoading,
    private _alerts: MxAlert,
    private _cache: MxCache,
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




  /**
   * Agrega o actualiza respuestas al mensaje en curso en FIRESTORE
   *
   * @param {RespuestaModel} respuesta - El objeto de respuesta
   * @return {Subject} Aviso al observable de cambios en la lista de respuestas
   */
  async setRespuesta( respuesta: RespuestaModel ) {
    const intentName = this._mensaje.current$.value.name
    const intentPath = `${ this.projectPath( 'set' ) }/intents/${ intentName }`
    const intentRef = this.fs.doc( intentPath)
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

      if ( respuesta.tipo &&
        respuesta.tipo != 'condicional' &&
        (await this.checkKindResponses(respuesta.tipo) > 1)
      ) {
        this._alerts.message(
          'No puedes agregar más de una respuesta de tipo ' + respuesta.tipo
        );
      } else {
        console.log(respuesta);
        // Object.keys(respuesta).forEach(key => { if (respuesta[key] == undefined) delete respuesta[key]})
        // Object.keys(respuesta.result).forEach(key => { if (respuesta.result[key] == undefined) delete respuesta.result[key]})
        for (let [key, value] of Object.entries(respuesta)) {
          console.log(respuesta[key as keyof RespuestaModel]);
          if (respuesta[key as keyof RespuestaModel] === undefined) delete respuesta[key as keyof RespuestaModel];
        }
        let result = respuesta.result;
        for (let [key, value] of Object.entries(result)) {
          console.log(result[key as keyof ResultResponse]);
          if (result[key as keyof ResultResponse] === undefined) delete result[key as keyof ResultResponse];
        }
        respuesta.result = result;

        let res = await intentRef.collection('responses').add(respuesta);
        await intentRef.collection('responses').doc(res.id).update({ id: res.id });
      }
    }

    return this.onRespuestasChanged.next(true);
  }

  /**
   * Revisa si existe alguna respuesta del tipo seleccionado
   *
   * @param {('simple' | 'grupo_datos' | 'buscar')} kind Tipo de respuesta. Puede ser 'simple' | 'grupo_datos' | 'buscar'
   * @return {number} Cantidad de veces que existe el tipo de respuesta
   */
  async checkKindResponses(
    kind: 'simple' | 'grupo_datos' | 'buscar' | 'sugerencias'
  ) {
    var resCant: boolean[] = [];
    await this._loading.asyncForEach(
      this._mensaje.respuestasList$.getValue(),
      (res: RespuestaModel) => {
        if (res.tipo == kind) resCant.push(true);
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
    const intentName = this._mensaje.current$.value.name
    const intentPath = `${ this.projectPath( 'set' ) }/intents/${ intentName }`
    const intentRef = this.fs.doc( intentPath)
    try {
      await intentRef.collection('responses').doc(respuestaId).delete();

      return this.onRespuestasChanged.next(true);
    } catch (error) {
      console.error(error);
      this._alerts.error('No se pudo eliminar', error);
    }
  }


  async updateRespuestasOrder( list: RespuestaModel[] ) {
    const intentName = this._mensaje.current$.value.name
    const intentPath = `${ this.projectPath( 'set' ) }/intents/${ intentName }`
    const intentRef = this.fs.doc( intentPath)
    const respRef = intentRef.collection('responses').ref
    const batch = this.fs.firestore.batch()

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
