import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { environment } from 'src/environments/environment';
import { iAgentInteraction } from '../models/interactions.model';
import { IntentStateModel, iTrainingPhrase } from '../models/intent.model';
import { IntentsService } from './intents.service';

@Injectable({
  providedIn: 'root',
})
export class InteractionsService {

  private _url = environment.restURL + 'intent';

  constructor(
    private _cache: MxCache,
    private _alert: MxAlert,
    private _afs: AngularFirestore,
    private _loading: MxLoading,
    private _http: HttpClient,
    private _intents: IntentsService
  ) {
  }

  projectPath(functionName?: string): string {
    const projectId = this._cache.getDataKey<string>( 'projectId' )
    const clientId = this._cache.getDataKey<string>( 'userId' )

    if ( !clientId ) {
      throw new MxErrorAlertModel( `No se encontró el clientId`, `interactions.service#${functionName}` )
    } else if ( !projectId ) {
      throw new MxErrorAlertModel( `No se encontró el projectId`, `interactions.service#${functionName}` )
    } else {
      return `usuarios/${clientId}/agentes/${ projectId }`
    }
  }

  async list() {
    const projectPath = this.projectPath(  'list' )
    const convsPath = `${projectPath}/conversations`
    let listDocs = await this._afs.collection
      <iAgentInteraction>( convsPath ).ref.get();
    let list: any[] = [];
    this._loading.asyncForEach(listDocs.docs, async (conv) => {
      let conver = conv.data();
      list.push(conver);
    });
    return list;
  }

  async getByClientId( clientId: string ) {
    const projectPath = this.projectPath( 'getConversation' )
    const convsPath = `${projectPath}/conversations`
    const convRef = this._afs.collection
      <iAgentInteraction>( convsPath ).ref
        .where( 'clientId', '==', clientId )
    // .orderBy('time')

    const convCol = await convRef.get();
    let conversation: iAgentInteraction[] = [];
    await this._loading.asyncForEach(convCol.docs, (interaction) => {
      if (!interaction.data()['checked']) {
        let inter = interaction.data();
        conversation.push(inter);
      }
    });
    return conversation;
  }

  async delete( convId: string ) {
    const projectPath = this.projectPath( 'getConversation' )
    const convPath = `${projectPath}/conversations/${convId}`;
    try {
      await this._afs.doc(convPath).ref.delete()
      this._alert.notify('Conversacion eliminada');
      return;
    } catch (error) {
      console.error(error);
      this._alert.notify('No fue posible borrar');
    }
  }

  async setChecked( convId: string ) {
    const projectPath = this.projectPath( 'getConversation' )
    const conversationsPath = `${projectPath}/conversations`
    const convRef = this._afs.collection(conversationsPath).ref.doc(convId);

    try {
      convRef.update({ checked: true });
      this._alert.notify('Actualizado');
    } catch (error) {
      console.error(error);
      this._alert.notify('Hubo problemas para actualizar');
    }
  }

  async addTraningPhrase(intentId: string, text: string, convId: string) {
    this._loading.toggleWaiting('open');
    const partialId = intentId.slice(intentId.lastIndexOf('/') + 1);
    const intentList = await this._intents.list
    const intentSelected = intentList.find((i) => i.name === partialId);
    const trainingPhrase: iTrainingPhrase = {
      parts: [{ text: text }], type: 'EXAMPLE'
    };

    if ( intentSelected ) {
      intentSelected.intent.trainingPhrases.push(trainingPhrase);
      await this.updateIntentApiRequest( intentSelected );
    } else {
      this._alert.error('No se logró encontrar el intent', 'conversations.service#addTrainingPhrase')
    }
    this._loading.toggleWaiting('close');
    this.setChecked(convId);
  }

  private updateIntentApiRequest(intentState: IntentStateModel): Promise<void> {
    const projectId = this._cache.getDataKey('projectId');
    const path = `projects/${ projectId }/agent/intents/${ intentState.name }`;
    const headers = new HttpHeaders({ responseType: 'json' })
    const body = { intent: intentState.intent, intetnView: 'INTENT_VIEW_FULL'}
    intentState.name = path;

    return new Promise((resolve, reject) => {
      this._http.put(this._url,body, {headers})
        .toPromise()
        .then((response) => {
          if (response) {
            console.info('Intent Updateado:', response);
            resolve();
          }
        })
        .catch((err) => {
          if (err) {
            console.error(err);
          }
          reject(err);
        });
    });
  }
}
