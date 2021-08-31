import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MxAlert, MxCache } from '@marxa/devkit';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilKeyChanged } from 'rxjs/operators';
import { RespuestaBuscarModel } from 'src/app/models/intent-response.model';
import { iParameter } from 'src/app/models/intent.model';
import { TarjetaModel } from 'src/app/models/tarjeta.model';
import { CurrentAgentService } from 'src/app/services/current-agent.service';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { ParametersService } from 'src/app/services/parameters.service';
import { RespuestasService } from 'src/app/services/respuestas.service';
import { TarjetasService } from 'src/app/services/tarjetas.service';

@Component({
  selector: 'as-search-response-form',
  templateUrl: './search-response-form.component.html',
  styleUrls: ['./search-response-form.component.scss']
})
export class SearchResponseFormComponent implements OnInit, OnDestroy {

  @Input() response: RespuestaBuscarModel = new RespuestaBuscarModel( '', '' )

  private _BuscarRes : BehaviorSubject<RespuestaBuscarModel> = new BehaviorSubject(this.response);
  @Input() set BuscarRes(form: RespuestaBuscarModel) { this._BuscarRes.next(form); }
  get BuscarRes() { return this._BuscarRes.getValue()}

  // paramSelected: string
  // dataBaseSelected: string
  dataBases: DataBase[] = [
    {value: 'tarjetas', displayName: 'Tarjetas'},
    {value: 'productos', displayName: 'Productos'}
  ]

  tarjetas: TarjetaModel[] = []

  @Output() onRespChanges: EventEmitter<RespuestaBuscarModel> = new EventEmitter()
  respuesta: RespuestaBuscarModel
  // paramList: iParameter[]  = []
  // paramsSubscription: Subscription

  constructor (
    public respuestas_: RespuestasService,
    private _cache: MxCache,
    public agente_: CurrentAgentService,
    private _alerts: MxAlert,
    private _mensaje: CurrentIntentService,
    private _tarjetas: TarjetasService,
    public  params_: ParametersService,
  ) {
    this.respuesta = new RespuestaBuscarModel('', '')
    // this.paramsSubscription =
    // this._mensaje.state$.subscribe(({ intent }) => {
    //   this.paramList = intent.parameters
    // })
  }

  async ngOnInit() {
    this.tarjetas = await this._tarjetas.get() || []
    this._BuscarRes.pipe(
      distinctUntilKeyChanged('parametro')
    ).subscribe( form => {
      // console.log(form);
      this.response = form
    } )
  }

  validateColeccionOnClick() {

    if (this.tarjetas.length < 1 ) {
      // this._alerts.sendMessageAlert('Debes crear una tarjeta o un producto primero')
      console.log( 'validate tarjetas o productos' )
    }
  }


  catchParamSelect( change: MatSelectChange ) {
    this.response.parametro = change.value
    this.onRespChanges.emit(this.respuesta)
  }

  catchDBSelect( change: MatSelectChange ) {
    this.response.database = change.value
    this.onRespChanges.emit( this.respuesta )
  }

  ngOnDestroy() {
    // if (this.paramsSubscription) this.paramsSubscription.unsubscribe()
  }

}

export interface DataBase {
  value: string, displayName: string
}
