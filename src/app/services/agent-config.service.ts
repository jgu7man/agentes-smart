import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MxAlert, MxCache, MxLoading } from '@marxa/devkit';
import { IntentModel } from '../dashboard/agente/mensajes/mensaje.model';
import { MensajesService } from '../dashboard/agente/mensajes/mensajes.service';

@Injectable({
  providedIn: 'root',
})
export class AgentConfigService {
  constructor(
    private _mensajes: MensajesService,
    private _af: AngularFirestore,
    private _loading: MxLoading,
    private _alerts: MxAlert,
    private _cache: MxCache
  ) // private _mensaje: CurrentMensajeService
  {}

  async restoreDefaultIntent(
    intent:
      | 'Default Welcome Intent'
      | 'Default Fallback Intent'
      | 'Default Context Intent'
  ) {
    // Init process
    this._loading.toggleWaiting('open');
    var intentList: IntentModel[] =
      (await this._cache.getAsyncKey<IntentModel[]>('intents')) || [];

    console.log('Search for intent');
    if (intentList && intentList.length > 0) {
      var defaultIntent: IntentModel | undefined = intentList.find(
        (i) => i.displayName == intent
      );

      if (defaultIntent) {
        console.log('Delete for default Intent');
        // DELETE INTENT
        // this._mensaje.delete(defaultIntent.name)
      }
    }

    console.log('Create in dialogflow');
    defaultIntent = await this._mensajes.createNewIntent({
      displayName: intent,
    });
    console.log('Intent seted: ', defaultIntent);

    console.log('Get the ID');
    const resourceID = defaultIntent.name?.slice(
      defaultIntent.name.lastIndexOf('/') + 1
    );

    console.log('Save on firestore');
    let path = this._cache.getDataKey<string>('agentePath');
    await this._af
      .collection(path + '/mensajes')
      .doc(resourceID)
      .set({
        name: resourceID,
        displayName: defaultIntent.displayName,
      });

    console.log('Process finished');
    this._mensajes.getDialogFlowIntents();

    this._loading.toggleWaiting('close');
    this._alerts.notify(intent + ' creado');
  }
}
