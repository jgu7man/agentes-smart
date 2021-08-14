import { Injectable } from '@angular/core';
import { concatMap, concatMapTo, debounceTime, mapTo, mergeMap, take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AgenteModel, iAgente } from '../models/agent.model';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading, MxText } from '@marxa/devkit';
import firebase from 'firebase/app';
import { MatDialog } from '@angular/material/dialog';
import { CreatingAgenteDialog } from '../dashboard/agentes-crud/creating-agente/creating-agente.dialog';
import { MxAuth } from '@marxa/auth';
import { of } from 'rxjs';
import { throwError } from 'rxjs';
import { AgentConfigService } from './agent-config.service';

@Injectable({ providedIn: 'root' })
export class AgentsService {
  /**
   * Observable de los agentes en FIRESTORE*/
  // public list$ = new Observable<AgenteModel[]>();
  private restURL = environment.restURL;
  private _user?: firebase.User

  constructor(
    private _af: AngularFirestore,
    private router: Router,
    private _cache: MxCache,
    private _alert: MxAlert,
    private _http: HttpClient,
    private _dialog: MatDialog,
    private _auth: MxAuth,
    private _text: MxText,
    private _config: AgentConfigService,
  ) {
    // this.list$ = this.listenList()
  }

  /** Establece la suscripción a los agentes */
  listenList(): Observable<iAgente[]> {
    const userId = this._cache.getDataKey<string>('clientId')
    if (!userId) {
      let error: MxErrorAlertModel = new MxErrorAlertModel(
        `El parámetro 'userId' tiene un valor inválido: ${userId}`);
      throw this._alert.error(error.message, error);
    } else {
      return this._af
        .collection('usuarios')
        .doc(userId)
        .collection<iAgente>('agentes')
        .valueChanges()
        .pipe(
          debounceTime(1000),
          catchError((error) => {
            throw this._alert.error(
              `No se pudieron cargar los agentes del usuario ${userId}`,
              error
            );
          }),
        );
    }
  }

  /** Obtiene un agente llamado por id
   * @param {string} projectId
   * @return {AgenteModel} Agente o null
   */
  async loadOne(projectId: string): Promise<AgenteModel | null> {
    const agentesList = await this._cache.getAsyncKey<AgenteModel[]>('agentes');

    try {
      if (!agentesList) {
        const error = new MxErrorAlertModel(
          `No se pudo obtener 'agentesList': ${agentesList}`,
          'loadOneAgente'
        );
        throw this._alert.error(error.message, error);
      } else if (!projectId) {
        const error = new MxErrorAlertModel(
          `No se pudo obtener 'projectId': ${projectId}`,
          'loadOneAgente'
        );
        throw this._alert.error(error.message, error);
      } else {
        const agenteDoc = agentesList.find((a) => a.projectId == projectId);
        if (agenteDoc) {
          return agenteDoc;
        } else {
          const error = new MxErrorAlertModel(
            `No se encontró el agente ${projectId}`,
            'loadOneAgente'
          );
          throw this._alert.error(error.message, error);
        }
      }
    } catch (error) {
      console.error(error);
      this._alert.error('Error en la base de datos', error);
      return null;
    }
  }

  async saveAgent( { projectId, displayName, defaultLanguageCode, timeZone }: AgenteModel ) {

    const createDialog = this._dialog.open(CreatingAgenteDialog, {
      minWidth: 300,
    });

    this._auth.user$.pipe( take( 1 ),
      concatMap<firebase.User, Observable<AgenteModel>>( user => {
        if ( !user ) {
          return throwError(
            new MxErrorAlertModel( `No está autenticado`, 'saveAgent' )
          )
        } else {
          const agente  = new AgenteModel(projectId, displayName, defaultLanguageCode, timeZone, user.uid)
          // Eliminar campos vacios
          Object.keys(agente).forEach((key) => {
            if (agente[key as keyof AgenteModel] == '' || agente[key as keyof AgenteModel] == undefined) delete agente[key as keyof AgenteModel];
          } );

          // Transformar id para generar un string único
          var sufixId = agente.displayName.split(' ').join('-').toLowerCase();
          agente.projectId = `${sufixId}-${this._text.generateRandomText(6)}`;
          console.log( { projectId: agente.projectId } );
          return of(agente)
        }
      } ),
      concatMap<AgenteModel, Observable<AgenteModel>>( agente =>
        this.createNewAgent( agente ).pipe( take( 1 ), mapTo( agente ) ) ),
      catchError(this.handleError)
      ).subscribe( async ( agente ) => {

        try {
          // Guardado a Firestore
          let agentePath = `usuarios/${agente.owner}/agentes/${agente.projectId}`
          await this._af.doc( agentePath ).set( {
            ...agente, created: new Date()
          })

          this.router.navigate( [ '/dashboard/agentes' ] );
          createDialog.close();
        } catch ( error ) {
          error['agente'] = agente
          this._alert.error(`No pudo guardarse el agente en firestore`, error)
          createDialog.close();
          return console.error(error)
        }
    });

  }

  // ? Crear proyecto
  createNewAgent(agente: AgenteModel): Observable<any> {
    const _Url = environment.restURL + 'agentes/create';

    let params = { ...agente };
    return this._http
      .post<{}>(_Url, params, {
        responseType: 'json',
        observe: 'body',
      }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.message);
      this._alert.error('No se pudo crear tu agente', error.message);
    } else {
      this._alert.error(
        `Backend returned code ${error.status} `,
        error
      );
    }

    return throwError('Something bad happened; please try again later.');
  }

  /** Edita el agente en FIRESTORE
   * @param {AgenteModel} agent
   */
  async edit(agent: AgenteModel): Promise<void> {
    const usuario = this._cache.getDataKey<firebase.User>('user');

    try {
      if (!usuario) {
        const error = new MxErrorAlertModel(
          `No se encontró el usuario en caché`,
          'editAgent'
        );
        throw this._alert.error(error.message, error);
      } else if ('projectId'! in agent) {
        const error = new MxErrorAlertModel(
          `No se encontró 'projectId' en agente: ${agent}`,
          'editAgent'
        );
        throw this._alert.error(error.message, error);
      } else {
        Object.keys(agent).forEach((key) => {
          if (agent[key as keyof AgenteModel] == undefined)
            delete agent[key as keyof AgenteModel];
        });

        const agenetRef = this._af.doc(
          `usuarios/${usuario.uid}/agentes/${agent.projectId}`
        ).ref;

        await agenetRef.set({ ...agent }, { merge: true });
        this._alert.notify('Agente editado');
        this.router.navigate(['/dashboard/agentes']);
        return;
      }
    } catch (error) {
      this._alert.error('No se pudo editar el agente', error);
      return console.error(error);
    }
  }

  delete(projectId: string): Observable<any> {
    const usuario = this._cache.getDataKey<firebase.User>('user');

    if (!usuario) {
      const error = new MxErrorAlertModel(
        `No se encontró el usuario en el caché`,
        'deleteAgente'
      );
      this._alert.error(error.message, error);
      throw console.error(error);
    } else {
      const { uid: clientId } = usuario;
      return this._http
        .delete(
          `${this.restURL}/agentes/delete?projectId=${projectId}&clientId=${clientId}`
        ).pipe(
          take( 1 ),
          catchError((error) => {
            throw this._alert.error(
              `No se pudo borrar el agente ${projectId}`,
              error
            );
          }),
          mergeMap( async ( result ) => {
            try {
              return await this.removeFromFirestore(usuario.uid, projectId)
            } catch (error) {
              if ('mensaje' in error) {
                this._alert.error(error.message, error)
              } else {
                this._alert.error(``, error)
              }
              return console.error(error)
            }
          })
        );
    }
  }


  private async removeFromFirestore( uid: string, projectId: string) {
    try {
      const batch = this._af.firestore.batch()
      const agenteRef = this._af.doc( `usuarios/${ uid }/agentes/${ projectId }` )
      const agenteDoc = await agenteRef.ref.get()
      if ( agenteDoc.exists ) {
        // Delete clients conversations
        const clientesCol = await agenteRef.collection( 'clientes' ).ref.get()
        if ( !clientesCol.empty ) {
          clientesCol.forEach( async client => {
            const conversation = await client.ref.collection( 'conversacion' ).get()
            if ( !conversation.empty ) {
              conversation.forEach( async inter => { batch.delete(inter.ref) })
            }
            batch.delete(client.ref)
          })
        }

        // Delete contexts
        const contextsCol = await agenteRef.collection( 'contextos' ).ref.get()
        if ( !contextsCol.empty ) {
          contextsCol.forEach( async context => { batch.delete(context.ref)})
        }

        // Delete integraciones
        const integraciones = await agenteRef.collection( 'integraciones' ).ref.get()
        if ( !integraciones.empty ) {
          integraciones.forEach( async integ => { batch.delete(integ.ref)})
        }

        // Delete conversaciones
        const conversacionesCol = await agenteRef.collection( 'conversaciones' ).ref.get()
        if ( !conversacionesCol.empty ) {
          conversacionesCol.forEach( async conv => { batch.delete(conv.ref)})
        }

        // Delete mensajes
        const mensajesCol = await agenteRef.collection( 'mensajes' ).ref.get()
        if ( !mensajesCol.empty ) {
          mensajesCol.forEach( async m => {
            const respuestasCol = await m.ref.collection( 'respuestas' ).get()
            if ( !respuestasCol.empty ) {
              respuestasCol.forEach( async r => { batch.delete(r.ref)})
            }
            batch.delete( m.ref )
          } )
        }

        // Delete parametros
        const parametrosCol = await agenteRef.collection( 'parametros' ).ref.get()
        if ( !parametrosCol.empty ) {
          parametrosCol.forEach( async param => { batch.delete( param.ref ) } )
        }

        // Delete tipos
        const tiposCol = await agenteRef.collection( 'tipos' ).ref.get()
        if ( !tiposCol.empty ) {
          tiposCol.forEach( async tipo => { batch.delete( tipo.ref)})
        }

        batch.delete( agenteDoc.ref )
        await batch.commit()
        return
      }
    } catch (error) {
      if ('mensaje' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(``, error)
      }
      return console.error(error)
    }
  }


}
