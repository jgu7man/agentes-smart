import { Injectable } from '@angular/core';
// import { Interaction, QuickResponse } from '../store/chat.model';
// import { Store } from '@ngrx/store';
// import * as actions from '../store/chat.actions';
import {
  map,
  switchMap,
  take,
  pluck,
  distinctUntilChanged,
  tap,
  catchError,
} from 'rxjs/operators';
import { BehaviorSubject, Subject, Subscription, throwError } from 'rxjs';
// import { AppState } from '../../app.state';
import { HttpClient } from '@angular/common/http';
import {
  ResultResponse,
  Sugerencia,
  RespuestaBuscarModel,
} from '../models/respuesta.model';
import { RespuestaCard } from '../models/dialogflow-responses.model';
import { environment } from 'src/environments/environment';
import { MxAlert, MxCache, MxErrorAlertModel } from '@marxa/devkit';
import firebase from 'firebase/app'
import { ChatSessionModel, Interaction, iSessionResponse, QuickResponse } from './chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  conversation: Interaction[] = [];
  conversation$: BehaviorSubject<Interaction[]> = new BehaviorSubject(<Interaction[]>[])
  panelOpened: boolean = false;
  sendMessage$: Subject<string> = new Subject();

  private _function =
    'https://us-central1-main-agentesmart.cloudfunctions.net/dialogflow/';
  private _localhost =
    'http://localhost:5001/main-agentesmart/us-central1/rest/';
  private _url = environment.restURL + 'session';
  private _projectId: string | null
  private _sessionId?: string | null;
  private _clientId?: string

  constructor(
    private _cache: MxCache,
    private _http: HttpClient,
    private _alert: MxAlert,
  ) {
    this.sendMessage();
    this._projectId = this._cache.getDataKey<string>('projectId');
    const user = this._cache.getDataKey<firebase.User>('user');
    this._clientId = user ? user.uid : undefined;
  }

  // opened = this._store.select('chat').pipe(map((chat) => chat.isOpened));

  toggleChatbox() {
    this.panelOpened = !this.panelOpened;
  }



  //   reciveMessage(message) {
  //     this._store.dispatch(actions.recive(message))
  //   }

  restoreConvesation(conversation: Interaction[]) {
    conversation.forEach( ( interaction ) => {
      this.conversation.push(interaction);
    });
  }

  sendMessage(): Subscription {
    // this._store.pipe(
    //     tap(r => console.log(r))
    // ).subscribe(act => console.log(act))

    return this.sendMessage$.pipe(
      map( ( message: string ) => {
        if ( !this._projectId ) {
          let error = new MxErrorAlertModel(`No se tiene el project id`,'sendMessage')
          return throwError( error )
        } else if ( !this._clientId ) {
          let error = new MxErrorAlertModel(`No se tiene el client id`,'sendMessage')
          return throwError( error )
        } else {

          this.conversation.push(new Interaction(message, 'this'))
          let request = new ChatSessionModel(
            this._projectId, this._clientId,
            {userId: 'TEST'}, message
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
      })
      ).subscribe( body => {
        this._http
          .post( this._url, body, { responseType: 'json' } ).pipe(
            map( res => res as iSessionResponse ),
            catchError( error => {
              throw this._alert.error( `Error en servidor al enviar mensaje`, error )
            } )
          ).subscribe( response => {
            console.log( response );
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

  reciveMessage(respuestas: ResultResponse[]) {
    if (respuestas.length > 0) {
      respuestas.forEach((resp: ResultResponse) => {
        if (resp != null) {
          console.log(resp);
          if (resp.suggestions && resp.suggestions.length > 0) {
            console.log( 'Sugerencias' );
            this.conversation.push(new Interaction(resp.text, 'that'))
            this.sendSuggestions(resp.suggestions);
          } else if (resp instanceof RespuestaBuscarModel) {
            console.log( 'Cards' );
            if (resp.card) this.sendCard(resp.card);
          } else {
            console.log('Texto');
            console.log(resp.text);
            this.conversation.push(new Interaction(resp.text, 'that'))
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
        value: sug.context,
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


}
