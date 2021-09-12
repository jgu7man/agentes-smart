import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MxAlert, MxCache } from '@marxa/devkit';
import { MessengerStatus } from 'src/app/models/integrations.model';
import { IntegracionesService } from 'src/app/services/integraciones.service';

@Component({
  selector: 'as-messenger-integration',
  templateUrl: './messenger-integration.component.html',
  styleUrls: ['./messenger-integration.component.scss'],
})
export class MessengerIntegrationComponent implements OnInit {
  projectId: string | null;
  msnStatus: MessengerStatus;
  constructor(
    private copy: Clipboard,
    private _cache: MxCache,
    private _alert: MxAlert,
    public _integration: IntegracionesService
  ) {
    this.projectId = this._cache.getDataKey<string>('projectId');
    this.msnStatus = new MessengerStatus('', false);
  }

  ngOnInit(): void {
    this._integration.getMessengerOptions().subscribe((data) => {
      console.log(data);
      if (data) {
        this.msnStatus = data;
      }
    });
  }

  savePageAccessToken() {
    this._integration.saveMessengerPageAccessToken(
      this.msnStatus.page_access_token
    );
  }

  copyMessenger(field: 'URL' | 'ID') {
    this.copy.copy(
      field === 'URL'
        ? `https://api.agentesmart.com/messenger/${this.projectId}`
        : `${this.projectId}`
    );
    this._alert.notify('Copiado');
  }

  toggleService( event: MatSlideToggleChange ) {
    if ( this.msnStatus.page_access_token ) {
      this._integration.toggleMessenger( event.checked )
      this.msnStatus.active = event.checked;
    } else {
      this._alert.message('No puedes activar este servicio si no has ingresado el "Page Access Token"')
    }
  }
}
