import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MxAlert, MxCache, MxErrorAlertModel, MxLoading } from '@marxa/devkit';
import { DialogflowIntentModel, iDialogflowIntent } from '../models/intent.model';
import { IntentsService } from './intents.service';

@Injectable({
  providedIn: 'root',
})
export class AgentConfigService {
  constructor(
    private _intents: IntentsService,
    private _af: AngularFirestore,
    private _loading: MxLoading,
    private _alerts: MxAlert,
    private _cache: MxCache
  ) // private _mensaje: CurrentMensajeService
  {}

}
