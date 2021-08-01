import { Injectable } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AgenteModel } from '../models/agente.model';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import firebase from 'firebase/app';

@Injectable({ providedIn: 'root' })
export class AgentesService {

  /**
   * Observable de los agentes en FIRESTORE*/
  public agentes$ = new Observable<AgenteModel[]>();
  private restURL = environment.restURL;

  constructor(
    private _af: AngularFirestore,
    private router: Router,
    private _cache: MxCache,
    private _alert: MxAlert,
    private _http: HttpClient
  ) {
    this.agentes$ = this._cache
      .listenForChanges<AgenteModel[]>('agentes')
      .pipe();
  }

  /** Establece la suscripción a los agentes */
  listenAgentes( userId: string ): Observable<AgenteModel[]> {
    if ( !userId ) {
      let error: MxErrorAlertModel = new MxErrorAlertModel(
        `El parámetro 'userId' tiene un valor inválido: ${ userId }`,
        `listenAgentes`
      );
      throw this._alert.error( error.message, error);
    } else {
      return this._af
        .collection('usuarios')
        .doc(userId)
        .collection<AgenteModel>('agentes')
        .valueChanges()
        .pipe(
          debounceTime( 1000 ),
          catchError(error => {throw this._alert.error(`No se pudieron cargar los agentes del usuario ${userId}`, error)}),
          tap((agentes) => this._cache.updateData('agentes', agentes))
        );
    }
  }

  /** Obtiene un agente llamado por id
   * @param {string} projectId
   * @return {AgenteModel} Agente o null
   */
  async loadOneAgente(projectId: string): Promise<AgenteModel | null> {
    const agentesList = await this._cache.getAsyncKey<AgenteModel[]>('agentes');

    try {
      if ( !agentesList ) {
        const error = new MxErrorAlertModel( `No se pudo obtener 'agentesList': ${ agentesList }`, 'loadOneAgente' );
        throw this._alert.error( error.message, error );
      } else if (!projectId) {
        const error = new MxErrorAlertModel( `No se pudo obtener 'projectId': ${ projectId }`, 'loadOneAgente' );
        throw this._alert.error( error.message, error );
      } else {

        const agenteDoc = agentesList.find((a) => a.projectId == projectId);
        if (agenteDoc) {
          return agenteDoc;
        } else {
          const error = new MxErrorAlertModel( `No se encontró el agente ${ projectId }`, 'loadOneAgente' );
          throw this._alert.error( error.message, error );
        }

      }
    } catch (error) {
      console.error(error);
      this._alert.error('Error en la base de datos', error);
      return null;
    }
  }

  /** Edita el agente en FIRESTORE
   * @param {AgenteModel} agent
   */
  async editAgent(agent: AgenteModel): Promise<void> {
    const usuario = this._cache.getDataKey<firebase.User>('user');

    try {
      if ( !usuario ) {
        const error = new MxErrorAlertModel( `No se encontró el usuario en caché`, 'editAgent' );
        throw this._alert.error( error.message, error );
      } else if ('projectId' !in agent) {
        const error = new MxErrorAlertModel( `No se encontró 'projectId' en agente: ${agent}`, 'editAgent' );
        throw this._alert.error( error.message, error );
      } else {

        Object.keys(agent).forEach((key) => {
          if (agent[key as keyof AgenteModel] == undefined)
            delete agent[key as keyof AgenteModel];
        } );

        const agenetRef = this._af.doc(
          `usuarios/${usuario.uid}/agentes/${agent.projectId}`
        ).ref;

        await agenetRef.set({ ...agent }, { merge: true });
        this._alert.notify( 'Agente editado' );
        this.router.navigate(['/dashboard/agentes']);
        return
      }
    } catch (error) {
      this._alert.error( 'No se pudo editar el agente', error );
      return console.error(error);
    }

  }

  deleteAgent( projectId: string ): Observable<any> {
    const usuario = this._cache.getDataKey<firebase.User>('user')

    if ( !usuario ) {
      const error = new MxErrorAlertModel( `No se encontró el usuario en el caché`, 'deleteAgente' );
      this._alert.error( error.message, error );
      throw console.error( error )
    } else {

      const { uid: clientId } = usuario

      return this._http
      .delete(
        `${this.restURL}/agentes/delete?projectId=${projectId}&clientId=${clientId}`
        )
        .pipe(catchError(error => {throw this._alert.error(`No se pudo borrar el agente ${ projectId}`, error)}),);
    }

  }

  // Arreglo de lenguaje
  lenguajes = [
    { name: 'Alemán', code: 'de' },
    { name: 'Coreano', code: 'ko' },
    { name: 'Español latino', code: 'es-419' },
    { name: 'Español españa', code: 'es-ES' },
    { name: 'Francés', code: 'fr' },
    { name: 'Francés canadiense', code: 'fr-CA' },
    { name: 'Francés de francia', code: 'fr-FR' },
    { name: 'Inglés', code: 'en' },
    { name: 'Inglés EUA', code: 'en-US' },
    { name: 'Inglés Británico', code: 'en-GB' },
    { name: 'Italiano', code: 'it' },
    { name: 'Japonés', code: 'ja' },
    { name: 'Noruego', code: 'no' },
    { name: 'Portugués', code: 'pt-BR' },
    { name: 'Ruso', code: 'ru' },
  ];

  // Arreglo de zonas horarias

  zonasHorarias = [
    { display: '(GMT-12:00) Etc/GMT+12', value: 'Etc/GMT+12' },
    { display: '(GMT-11:00) Pacific/Midway', value: 'Pacific/Midway' },
    { display: '(GMT-10:00) Pacific/Honolulu', value: 'Pacific/Honolulu' },
    { display: '(GMT-9:00) America/Anchorage', value: 'America/Anchorage' },
    { display: '(GMT-9:00) US/Alaska', value: 'US/Alaska' },
    {
      display: '(GMT-8:00) America/Los_Angeles',
      value: 'America/Los_Angeles',
    },
    { display: '(GMT-7:00) Monterrey/Denver', value: 'America/Denver' },
    {
      display: '(GMT-6:00) Guatemala/CDMX/Chicago',
      value: 'America/Chicago',
    },
    {
      display: '(GMT-5:00) Lima/Bogotá/New_York/',
      value: 'America/New_York',
    },
    {
      display: '(GMT-4:00) Santiago/La Paz/Barbados',
      value: 'America/Barbados',
    },
    {
      display: '(GMT-3:00) Buenos_Aires/São Paulo',
      value: 'America/Buenos_Aires',
    },
    {
      display: '(GMT-2:00) Atlantic/South_Georgia',
      value: 'Atlantic/South_Georgia',
    },
    {
      display: '(GMT-1:00) Atlantic/Cape_Verde',
      value: 'Atlantic/Cape_Verde',
    },
    { display: '(GMT0:00) Africa/Casablanca', value: 'Africa/Casablanca' },
    { display: '(GMT+1:00) Europe/Madrid', value: 'Europe/Madrid' },
    {
      display: '(GMT+2:00) Europe/Kaliningrad',
      value: 'Europe/Kaliningrad',
    },
    { display: '(GMT+3:00) Europe/Moscow', value: 'Europe/Moscow' },
    { display: '(GMT+4:00) Asia/Dubai', value: 'Asia/Dubai' },
    { display: '(GMT+4:30) Asia/Kabul', value: 'Asia/Kabul' },
    {
      display: '(GMT+5:00) Asia/Yekaterinburg',
      value: 'Asia/Yekaterinburg',
    },
    { display: '(GMT+5:30) Asia/Colombo', value: 'Asia/Colombo' },
    { display: '(GMT+5:45) Asia/Kathmandu', value: 'Asia/Kathmandu' },
    { display: '(GMT+6:00) Asia/Almaty', value: 'Asia/Almaty' },
    { display: '(GMT+6:30) Asia/Rangoon', value: 'Asia/Rangoon' },
    { display: '(GMT+7:00) Asia/Bangkok', value: 'Asia/Bangkok' },
    { display: '(GMT+8:00) Asia/Hong_Kong', value: 'Asia/Hong_Kong' },
    { display: '(GMT+9:00) Asia/Tokyo', value: 'Asia/Tokyo' },
    { display: '(GMT+9:30) Australia/Darwin', value: 'Australia/Darwin' },
    { display: '(GMT+10:00) Australia/Sydney', value: 'Australia/Sydney' },
    { display: '(GMT+11:00) Pacific/Noumea', value: 'Pacific/Noumea' },
    { display: '(GMT+12:00) Pacific/Fiji', value: 'Pacific/Fiji' },
    {
      display: '(GMT+13:00) Pacific/Tongatapu',
      value: 'Pacific/Tongatapu',
    },
  ];
}
