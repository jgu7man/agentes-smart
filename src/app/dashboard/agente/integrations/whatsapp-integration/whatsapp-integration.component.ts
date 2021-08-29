import { Component, OnInit } from '@angular/core';
import { MxAlert, MxLoading } from '@marxa/devkit';
import { WhatsappStatus } from 'src/app/models/integrations.model';
import { IntegracionesService } from 'src/app/services/integraciones.service';

@Component({
  selector: 'as-whatsapp-integration',
  templateUrl: './whatsapp-integration.component.html',
  styleUrls: ['./whatsapp-integration.component.scss']
})
export class WhatsappIntegrationComponent implements OnInit {

  waCode: string = ''
  waStatus: WhatsappStatus
  waConnection: boolean = false
  constructor (
    private _integration: IntegracionesService,
    private _alert: MxAlert,
    private _loading: MxLoading
  ) {
    this.waStatus = {
      status: 'DISCONNECTED',
      qr:''
    }
  }

  ngOnInit(): void {
    this._integration.listenQRCode().subscribe( data => {
        console.log( data )
        if ( data ) {
            this.waStatus = data
            if ( this.waStatus.status == 'DISCONNECTED' && !this.waStatus.qr ) {
              this.waConnection = false
              }
        }
    })
  }

  disableRequestCode() {
    if ( this.waConnection ) {
      return true
    } else if ( this.waStatus && this.waStatus.qr ) {
      return true
    } else return false
  }



  requestCode() {
    this.waConnection = true
    // this._loading.toggleWaitingSpinner(true)
    this._integration.getQRCode().subscribe(
      response => {
        console.log( response )
        if ( response.type === 'error' ){
          this._alert.error( response.message, response )
          this.waConnection = false
        }

        else if (response.type === 'ok') {
          this._loading.toggleWaiting('close')
        }

      },
      error => {
        console.error( error );
        this._loading.toggleWaiting('close')
        if ( this.waStatus.status == 'DISCONNECTED' ) {
          this._integration.disconnect()
          // console.log( 'Se agotó el tiempo de espera' )
          // this._alert.sendMessageAlert('Se agotó el tiempo de espera')
        } else {
          this._integration.clearQR()
        }
      }
    )
  }


}
