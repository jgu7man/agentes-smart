import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, distinct, skip, tap, distinctUntilKeyChanged, map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { MxAlert, MxCache, MxErrorAlertModel } from '@marxa/devkit';
import { MessengerStatus, WhatsappStatus } from '../models/integrations.model';

@Injectable({
  providedIn: 'root'
})
export class IntegracionesService {

  url: string = environment.restURL + 'whatsapp'
  wappHost: string = 'ws://localhost:8999'
  wappSocket$?: WebSocketSubject<any>
  constructor (
    private _http: HttpClient,
    private _cache: MxCache,
    private _alert: MxAlert,
    private _fs: AngularFirestore
  ) {
  }

  projectPath(functionName?: string): string {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'userId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, `integrations.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `integrations.service#${functionName}` )
    } else {
      return `usuarios/${clientId}/agentes/${ projectId }`
    }
  }


  saveMessengerPageAccessToken( token: string ) {
    const projectPath = this.projectPath( 'saveMessengerPageAccessToken' )
    const integrationsPath = `${ projectPath }/integrations`

        this._fs.doc( integrationsPath + '/messenger' ).set( {
            page_access_token: token
        }, { merge: true } )
            .then( () => this._alert.notify( 'Token guardado' ) )
            .catch( error => {
            console.error(error);
            this._alert.error('No se pudo guardar', error)
        })
    }

  getMessengerOptions() {
    const projectPath = this.projectPath( 'saveMessengerPageAccessToken' )
    const integrationsPath = `${ projectPath }/integrations`
    return this._fs.doc<MessengerStatus>
      ( integrationsPath + '/messenger' )
      .valueChanges().pipe(  )
  }

  toggleMessenger(toggleValue: boolean) {
    const projectPath = this.projectPath( 'saveMessengerPageAccessToken' )
    const path = `${ projectPath }/integrations/messenger`
    this._fs.doc<MessengerStatus>(path).update({active: toggleValue})
  }


  listenQRCode() {
    const projectPath = this.projectPath( 'saveMessengerPageAccessToken' )
    const integrationsPath = `${ projectPath }/integrations`
    return this._fs.doc<WhatsappStatus>( integrationsPath+'/whatsapp' )
      .valueChanges().pipe( skip( 2 ))
  }

  getQRCode(): Observable<any> {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `integrations.service#getQRCode` )
    } else {
      this.wappSocket$ = webSocket(`${this.wappHost}/wa-connect?projectId=${projectId}`)
      return this.wappSocket$
    }
  }

  disconnect() {
    const projectPath = this.projectPath( 'saveMessengerPageAccessToken' )
    const integrationsPath = `${ projectPath }/integrations`
    this._fs.doc( integrationsPath+'/whatsapp' ).ref.set( { qr: '', status: 'DISCONNECTED' } )
  }

  clearQR() {
    const projectPath = this.projectPath( 'saveMessengerPageAccessToken' )
    const integrationsPath = `${ projectPath }/integrations`
    this._fs.doc( integrationsPath+'/whatsapp' ).ref.set( { qr: ''  }, { merge: true} )
  }

  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error( 'Ocurrió un error:', error.error.message );
      this._alert.error('Ocurrió un error', error.error.message)
    } else {
      this._alert.error(`Backend returned code ${error.status}`, error)
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  }
}
