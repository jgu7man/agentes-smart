import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MxAlert, MxCache, MxErrorAlertModel } from '@marxa/devkit';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { iClient } from '../models/agent-clients.model';
import { iAgentInteraction } from '../models/interactions.model';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  list$: Observable<iClient[]>

  constructor (
    private _afs: AngularFirestore,
    private _cache: MxCache,
    private _alert: MxAlert,
  ) {
    this.list$ = this.listenList$()
  }

  projectPath( functionName?: string ): string {
    const userId = this._cache.getDataKey<string>( 'userId' )

    if ( !userId ) {
      throw new MxErrorAlertModel( `No se encontró el userId`, `itents.service#${functionName}` )
    } else {
      return `usuarios/${userId}`
    }
  }

  listenList$() {
    const path = `${ this.projectPath( 'listenList$' ) }/clients`

    return this._afs.collection<iClient>( path,
      ref => ref.orderBy('lastUpdate', 'desc')
    ).valueChanges()
      .pipe(
        tap(list => console.log(list)),
        catchError( ( error ) => {
          this._alert.error(`Error al obtener la lista de clientes`, error)
          return of([])
        } )

      )
  }

  listenConversation(clientId: string): Observable<iAgentInteraction[]> {
    const path = `${ this.projectPath( 'listenConversation' ) }/clients/${ clientId }/conversation`

    return this._afs.collection<iAgentInteraction>( path,
      ref => ref.orderBy( 'time' )
    ).valueChanges()
    .pipe(
      tap(list => console.log(list)),
      catchError( ( error ) => {
        this._alert.error(`Error al obtener la conversación`, error)
        return of([])
      } )

    )
  }

  getByCID(clientId: string) {
    const path = `${ this.projectPath( 'getByCID' ) }/clients/${ clientId }`

    return this._afs.doc<iClient>(path).valueChanges()
  }

  async save( client: iClient) {
    const path = `${ this.projectPath( 'listenConversation' ) }/clients/${ client.clientId }`
    await this._afs.doc( path ).ref.set( { ...client }, { merge: true } )
    return
  }

  async delete( cid: string ) {
    const path = `${ this.projectPath( 'listenConversation' ) }/clients/${ cid }`
    await this._afs.doc( path ).ref.delete()
    return
  }

}
