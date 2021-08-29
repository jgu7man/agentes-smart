import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef } from '@angular/material/dialog';
import { MxAlert, MxCache, MxLoading } from '@marxa/devkit';
import { RespuestaModel, ResultResponse } from 'src/app/models/intent-response.model';
import { iIntentState } from 'src/app/models/intent.model';
import { IntentsService } from 'src/app/services/intents.service';
import { FallbackComponent } from './fallback/fallback.component';

@Component({
  selector: 'as-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {

  intent?: iIntentState;
  respuesta!: RespuestaModel;
  result!: ResultResponse;
  respuestaPath: string = ''
  constructor(
    private _alerts: MxAlert,
    private _loading: MxLoading,
    private _afs: AngularFirestore,
    private _cache: MxCache,
    private _intents: IntentsService,
    public dialog_: MatDialogRef<FallbackComponent>,
  ) {
    // this.result = new SimpleModel('', []);
    // this.respuesta = new RespuestaModel('simple', this.result, 0);
  }

  ngOnInit(): void {
    // this._loading.toggleWaitingSpinner( true )

    this.getFallbackIntent();
  }

  async getFallbackIntent() {
    const intentList: iIntentState[] = await this._intents.list
    this.intent = intentList.find(
      (i) => i.displayName == 'Default Fallback Intent'
    );

    if ( this.intent ) {

      const agentePath = this._cache.getDataKey('agentePath');
      this.respuestaPath =
        agentePath + `/mensajes/${this.intent.name}/respuestas`;
      const respuestasCol = await this._afs
        .collection(this.respuestaPath)
        .ref.get();

      if (respuestasCol.size > 0) {
        const respuestaDoc = respuestasCol.docs[0];
        this.respuesta = respuestaDoc.data() as RespuestaModel;
        this.result = this.respuesta.result;
      }
    } else {
      this._alerts.message('No se encontró el intent de fallback')
    }

    // this._loading.toggleWaitingSpinner(false)
  }

  catchText(respuesta: string) {
    this.result.text = respuesta;
  }

  saveRespuesta() {
    this.respuesta.result = { ...this.result };
    Object.keys(this.respuesta).forEach((key) => {
      if ( this.respuesta[ key as keyof RespuestaModel ] == undefined )
        delete this.respuesta[ key as keyof RespuestaModel ];
    });

    try {
      if (this.respuesta.id) {
        console.log('edited', { ...this.respuesta });
        this._afs
          .collection(this.respuestaPath)
          .doc(this.respuesta.id)
          .set({ ...this.respuesta });
      } else {
        console.log('new', { ...this.respuesta });
        this._afs
          .collection(this.respuestaPath)
          .add({ ...this.respuesta })
          .then((doc) => doc.update({ id: doc.id }));
      }

      this._alerts.notify('Respuesta guardada');
      this.dialog_.close();
    } catch (error) {
      console.error(error);
      this._alerts.error('Error', error);
    }
  }
}
