import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { concatMap, debounceTime, map, mapTo, mergeMap, take, catchError } from 'rxjs/operators';
import { MxAlert, MxCache, MxErrorAlertModel } from '@marxa/devkit';
import { MxAuth } from '@marxa/auth';
import { MxStorage } from '@marxa/storage';
import { MatDialog } from '@angular/material/dialog';
import { AgenteModel, iAgente, ImageUri } from '../models/agent.model';
import { CreatingAgenteDialog } from '../dashboard/agentes-crud/creating-agente/creating-agente.dialog';
import { environment } from 'src/environments/environment';
import firebase from 'firebase/app';

@Injectable({ providedIn: 'root' })
export class AgentsService {

  private restURL = environment.restURL;

  constructor(
    private _af: AngularFirestore,
    private _alert: MxAlert,
    private _auth: MxAuth,
    private _cache: MxCache,
    private _dialog: MatDialog,
    private _http: HttpClient,
    private _router: Router,
    private _storage: MxStorage,
  ) {
  }




  /** Observable que escucha los agentes del usuario en tiempo real
   * @returns {*}  {Observable<iAgente[]>}
   */
  get list$(): Observable<iAgente[]> {
    const userId = this._cache.getDataKey<string>('userId')
    if (!userId) {
      let error: MxErrorAlertModel = new MxErrorAlertModel(
        `El parámetro 'userId' tiene un valor inválido: ${userId}`);
      throw this._alert.error(error.message, error);
    } else {
      return this._af.collection
        <iAgente>( `usuarios/${ userId }/agentes` ).valueChanges()
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




  /** Crea un agente nuevo
   * @param {iAgente} agent iAgente
   */
  async create( { displayName, defaultLanguageCode, timeZone, owner, description, avatarUri }: iAgente ) {

    const createDialog = this._dialog.open(CreatingAgenteDialog, {
      minWidth: 300,
    });

    this._auth.user$.pipe( take( 1 ),
      // PREPARE AGENT TO SAVE
      concatMap<firebase.User, Observable<AgenteModel>>( user => {
        if ( !user ) {
          return throwError(
            new MxErrorAlertModel( `No está autenticado`, 'saveAgent' )
          )
        } else {
          const agente = new AgenteModel( displayName, defaultLanguageCode, timeZone, owner, user.uid, description, avatarUri)
          return of(agente)
        }
      } ),

      // SEND TO BACKEND TO CREATE PROJECT AND AGENT
      concatMap<AgenteModel, Observable<AgenteModel>>( agente =>
        this.createNewDialogflowAgent$( agente ).pipe( take( 1 ), mapTo( agente ) ) ),
      catchError(this.handleError)
      ).subscribe( async ( agente ) => {

        try {
          // SAVE IN FIRESTORE
          let agentePath = `usuarios/${agente.owner}/agentes/${agente.projectId}`
          await this._af.doc( agentePath ).set( {
            ...agente, created: new Date()
          })

          this._router.navigate( [ '/dashboard/agentes' ] );
          createDialog.close();
        } catch ( error ) {
          error['agente'] = agente
          this._alert.error(`No pudo guardarse el agente en firestore`, error)
          createDialog.close();
          return console.error(error)
        }
    });

  }


  private uploadAvatar(displayName: string):Observable<ImageUri> {
    return this._storage.upload().pipe(
      take( 1 ),
      map( files => {
        if ( files.length > 0 ) {
          if ( files[ 0 ].url ) {
            return <ImageUri> {
              url: files[ 0 ].url,
              alt: `${displayName} avatar`
            }
          } else {
            throw new MxErrorAlertModel(`No se encontró la url del avatar para el agente`, 'onSubmit')
          }
        } else {
          throw new MxErrorAlertModel(`No se cargó ningún archivo de avatar para el agente`, 'onSubmit')
        }
      }),
      catchError( ( error ) => {
        throw new MxErrorAlertModel( `Error cargando el archivo avatar para el agente`, 'onSubmit', error )
      } ),
    )
  }


  /** Crea un agente en dialogflow del proyecto asignado
   * @private
   * @param {AgenteModel} agente
   * @returns {*}  {Observable<any>}
   */
  private createNewDialogflowAgent$(agente: AgenteModel): Observable<any> {
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
   * @param {iAgente} agent
   */
  async edit(agent: iAgente): Promise<void> {
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
          if (agent[key as keyof iAgente] == undefined)
            delete agent[key as keyof iAgente];
        });

        const agenetRef = this._af.doc(
          `usuarios/${usuario.uid}/agentes/${agent.projectId}`
        ).ref;

        await agenetRef.set({ ...agent }, { merge: true });
        this._alert.notify('Agente editado');
        this._router.navigate(['/dashboard/agentes']);
        return;
      }
    } catch (error) {
      this._alert.error('No se pudo editar el agente', error);
      return console.error(error);
    }
  }


  /** Elimina el agente en dialogflow y si esta se ejecuta, elimina el agente en firestore
   * @param {string} projectId
   * @returns {*}  {Observable<any>}
   */
  delete$(projectId: string): Observable<any> {
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
              if ('message' in error) {
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

/** Elimina el agente recientemente eliminado en dialogflow con todas sus subcolecciones
 * @private
 * @param {string} uid string
 * @param {string} projectId
 * @returns {*}
 */
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
        const interactionsCol = await agenteRef.collection( 'interactions' ).ref.get()
        if ( !interactionsCol.empty ) {
          interactionsCol.forEach( async conv => { batch.delete(conv.ref)})
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
      if ('message' in error) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error(``, error)
      }
      return console.error(error)
    }
  }


}
