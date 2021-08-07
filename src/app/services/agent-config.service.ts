import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { DialogflowIntentModel, iDialogflowIntent } from '../models/mensaje.model';
import { MensajesService } from './mensajes.service';

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
    displayName:
      | 'Default Welcome Intent'
      | 'Default Fallback Intent'
      | 'Default Context Intent'
  ) {
    // Init process
    this._loading.toggleWaiting('open');
    var intentList: iDialogflowIntent[] =
      (await this._cache.getAsyncKey<iDialogflowIntent[]>('intents')) || [];

    console.log('Search for intent');
    if (intentList && intentList.length > 0) {
      var defaultIntent: iDialogflowIntent | undefined = intentList.find(
        (i) => i.displayName == displayName
      );

      if (defaultIntent) {
        console.log('Delete for default Intent');
        // DELETE INTENT
        // this._mensaje.delete(defaultIntent.name)
      }
    }
    let projectId = this._cache.getDataKey<string>( 'projectId' )
    if ( !projectId ) {
      throw new MxErrorAlertModel(`No se encontró el projectId`, 'restoreDefaultIntet')
    } else {
      let intent = new DialogflowIntentModel(projectId, displayName)
      console.log('Create in dialogflow');
      defaultIntent = await this._mensajes.createNewIntent(intent);
      console.log('Intent seted: ', defaultIntent);

      console.log('Get the ID');
      const resourceID = defaultIntent?.name?.slice(
        defaultIntent.name.lastIndexOf('/') + 1
      );

      console.log('Save on firestore');
      let path = this._cache.getDataKey<string>('agentePath');
      await this._af
        .collection(path + '/mensajes')
        .doc(resourceID)
        .set({
          name: resourceID,
          displayName: defaultIntent?.displayName,
        });

      console.log('Process finished');
      this._mensajes.getDialogFlowIntents();

      this._loading.toggleWaiting('close');
      this._alerts.notify(displayName + ' creado');

    }

  }
}
