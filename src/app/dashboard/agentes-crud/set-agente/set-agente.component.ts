import { Component, Input, OnInit } from '@angular/core';
import { AgenteModel, iAgente, ImageUri } from 'src/app/models/agente.model';
import { AgentesService } from 'src/app/services/agentes.service';
import firebase from 'firebase/app'
import { MxAlert, MxCache, MxErrorAlertModel } from '@marxa/devkit';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ZoneConfigService } from 'src/app/admin/utils/zone-config.service';
import { MxStorage } from '@marxa/storage';
import { catchError, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './set-agente.component.html',
  styleUrls: ['./set-agente.component.scss']
})
export class SetAgenteComponent implements OnInit {

  agente?: iAgente | null
  user: firebase.User | null;
  folder!: string
  avatarCtrl: FormControl

  agenteForm: FormGroup

  constructor(
    private _agentes: AgentesService,
    private _cache: MxCache,
    private _alert: MxAlert,
    private _storage: MxStorage,
    private _route: ActivatedRoute,
    public zoneConfig: ZoneConfigService,
  ) {
    this.agenteForm = new FormGroup( {
      displayName: new FormControl( '', [ Validators.required ] ),
      defaultLanguageCode: new FormControl( 'es-419', [ Validators.required ] ),
      timeZone: new FormControl( 'America/New_York', [ Validators.required]),
      description: new FormControl( '' ),
      avatarUri: this.avatarCtrl =  new FormControl( '' )
    } )

    this.user = this._cache.getDataKey( 'user' )
    if ( this.user ) {
      this.folder = `${this.user.uid}/agentes/`
    } else {
      let error = new MxErrorAlertModel( `No se encontró el usuario autenticado en el formulario de creación de agentes`)
      this._alert.error(error.message, error)
    }
  }



  async ngOnInit() {
    let agenteId = this._route.snapshot.params['id']
    if ( agenteId ) {
      this.agente = await this._agentes.loadOne(agenteId)
      if ( this.agente ) {
        this.agenteForm.patchValue( this.agente )
      }
    }
  }

  onSubmit() {
    let agente: iAgente = this.agenteForm.value
    if ( this.avatarCtrl.value === '' && this._storage.files.length > 0 ) {
      this._storage.upload().pipe(
        take(1),
        catchError((error) => {throw new MxErrorAlertModel(`Error cargando el archivo avatar para el agente`, 'onSubmit', error)})
      ).subscribe( ( files ) => {
        if ( files.length > 0 ) {
          if ( files[ 0 ].url ) {
            agente.avatarUri = {
              url: files[ 0 ].url,
              alt: `${agente.displayName} avatar`
            }

            if ( this.agente ) {
              this._agentes.edit(agente)
            } else {
              this._agentes.saveAgent(agente)
            }

          } else {
            let error = new MxErrorAlertModel(`No se encontró la url del avatar para el agente`, 'onSubmit')
            this._alert.error(error.message, error)
          }
        } else {
          let error = new MxErrorAlertModel(`No se cargó ningún archivo de avatar para el agente`, 'onSubmit')
          this._alert.error(error.message, error)
        }
      }, error => {
        if ( 'message' in error ) {
          this._alert.error(error.message, error)
        } else {
          this._alert.error(`Error intentando subir el archivo avatar del agente`, error)
        }
      })
    } else {
      if ( this.agente ) {
        this._agentes.edit(agente)
      } else {
        this._agentes.saveAgent(agente)
      }
    }
  }

}
