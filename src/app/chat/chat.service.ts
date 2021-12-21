import { Injectable } from '@angular/core';
import { map, take, catchError} from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  IntentResponseResult,
  Sugerencia,
  SearchResponseModel,
} from '../models/intent-response.model';
import { RespuestaCard } from '../models/dialogflow-responses.model';
import { environment } from 'src/environments/environment';
import { MxAlert, MxCache, MxErrorAlertModel } from '@marxa/devkit';
import firebase from 'firebase/app'
import { ChatSessionModel, Interaction, iSessionResponse, QuickResponse } from './chat.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  conversation: Interaction[] = [];
  sendMessage$: Subject<string> = new Subject();
  messageSended$: Subject<boolean> = new Subject();
  messageSuccess$: Subject<boolean> = new Subject()

  private _function =
    'https://us-central1-main-agentesmart.cloudfunctions.net/dialogflow/';
  private _localhost =
    'http://localhost:5001/main-agentesmart/us-central1/rest/';
  private _url = environment.restURL + '/session';
  private debugmode = environment.debugMode;
  private _sessionId?: string | null;


  constructor(
    private _cache: MxCache,
    private _http: HttpClient,
    private _alert: MxAlert,
    private _afs: AngularFirestore
  ) {}



  /** Define la ruta del angente actual
   * @param {string} [functionName] Opcionalmente, ingresa el nombre de la funcion para seguimiento del error
   * @returns {*}  {string} Ruta del proyecto
   */
   projectPath(functionName?: string): string {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const userId = this._cache.getDataKey<string>( 'userId' )

    if ( !userId ) {
      throw new MxErrorAlertModel( `No se encontró el userId`, `itents.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `itents.service#${functionName}` )
    } else {
      return `usuarios/${userId}/agentes/${ projectId }`
    }
  }

  restoreConvesation( conversation?: Interaction[] ) {
    // if ( !conversation ) {
    //   this._afs.
    // }
    conversation?.forEach( ( interaction ) => {
      this.conversation.push(interaction);
    });
  }

  listenForMessage(userId: string, projectId: string, clientId: string ): Subscription {
    this.messageSended$.next(false)
    return this.sendMessage$.pipe(
      map<string, ChatSessionModel>( ( message: string ) => {
        // Listen for forbbiden data
        if ( !projectId ) {
          let error = new MxErrorAlertModel(`No se tiene el project id`,'sendMessage')
          throw error
        } else if ( !userId ) {
          let error = new MxErrorAlertModel(`No se tiene el client id`,'sendMessage')
          throw error
        } else {

          // BUILD BODY REQUEST
          let request = new ChatSessionModel(
            this.debugmode, projectId, userId, { clientId }, message,
          )
          // search for sessionId in storage
          this._sessionId = this._cache.getDataKey<string>( 'currentSession' );
          if (this._sessionId) request.sessionId = this._sessionId;
          // search for contexts in storage
          let inputContexts = this._cache.getDataKey('inputContexts');
          if (inputContexts) request.inputContexts = inputContexts;

          console.log( request );
          return request
        }
      } )
    ).subscribe( ( body: ChatSessionModel ) => {
      // Update conversation state
      let requestMessage = new Interaction( body.textInput, 'this', true )
      this.conversation.push(requestMessage)
      this.messageSended$.next( true )
      this.messageSuccess$.next( false )

      // Send message to API request
      this._http.post( this._url, body, { responseType: 'json' } ).pipe(
        take(1),
        map( res => res as iSessionResponse ),
        catchError( error => {
          throw this._alert.error( `Error en servidor al enviar mensaje`, error )
        } ),
      ).subscribe( response => {
        // Reciving message
        console.log( response );
        this.conversation.map( m => m.id === requestMessage.id
          ? {...m, success: true} : m )
        this.messageSuccess$.next( true )
        // save the sessionId in storage
        this._cache.updateData('currentSession', response['session']);
        // save the contexts in storage
        this._cache.updateData('inputContexts', response['contextos']);

        this.reciveMessage(response['respuestas']);
      });

    }, error =>{
        if ( 'message' in error ) {
          this._alert.error(error.message, error);
        } else {
          this._alert.error('No se pudo estrucurar el mensaje para enviarlo', error)
        }
    } );
  }

  reciveMessage(respuestas: IntentResponseResult[]) {
    if (respuestas && respuestas.length > 0) {
      respuestas.forEach((resp: IntentResponseResult) => {
        if (resp != null) {
          console.log(resp);
          if (resp.suggestions && resp.suggestions.length > 0) {
            console.log( 'Sugerencias' );
            this.conversation.push(new Interaction(resp.text, 'that'))
            this.sendSuggestions(resp.suggestions);
          } else if (resp instanceof SearchResponseModel) {
            console.log( 'Cards' );
            if (resp.card) this.sendCard(resp.card);
          } else {
            console.log('Texto');
            console.log( resp.text );
            let lines = resp.text.split( `\\n` );
            console.log( lines )
            lines.forEach( line => {
              this.conversation.push(new Interaction(line, 'that'))
            })
          }
        }
      });
    } else {
      this.conversation.push(new Interaction('Entendí lo que dijiste pero no sé qué responder.', 'that'))

    }
  }

  sendSuggestions(sugerencias: Sugerencia[]) {
    let suggestions: QuickResponse[] = sugerencias.map((sug) => {
      return {
        displayText: sug.text,
        value: sug.context || '',
      };
    } );
    this.conversation.push(new Interaction(suggestions, 'that'))
    // this._store.dispatch(actions.recive({ message: suggestions }));
  }

  sendCard( card: RespuestaCard ) {
    this.conversation.push( new Interaction( card.title, 'that' ) );
    if ( card.subtitle )
      this.conversation.push( new Interaction( card.subtitle, 'that' ) );
    if ( card.imageUri )
      this.conversation.push( new Interaction( card.imageUri, 'that' ) );
    if ( card.body )
      this.conversation.push( new Interaction( card.body, 'that' ) );
    if ( card.buttons )
      this.conversation.push( new Interaction( card.buttons, 'that' ) );
  }


  async clearSession() {
    const userId = this._cache.getDataKey<string>( 'userId' )

    if ( !userId ) {
      throw new MxErrorAlertModel( `No se encontró el userId`, `chat.service#clearSession` )
    } else {
      const path = `usuarios/${userId}/clients/TEST`
      const testDoc = await this._afs.doc( path ).ref.get()

      if ( testDoc.exists ) {
        testDoc.ref.update( {
          session: firebase.firestore.FieldValue.delete()
        } )
        this._alert.notify('Sesión eliminada')
      }
    }

  }

}
