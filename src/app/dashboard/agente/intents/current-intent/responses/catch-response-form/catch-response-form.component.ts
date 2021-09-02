import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MxAlert, MxCache } from '@marxa/devkit';
import { BehaviorSubject } from 'rxjs';
import { RegistroDatosModel } from 'src/app/models/intent-response.model';
import { CurrentAgentService } from 'src/app/services/current-agent.service';
import { CurrentIntentService } from 'src/app/services/current-intent.service';

@Component({
  selector: 'as-catch-response-form',
  templateUrl: './catch-response-form.component.html',
  styleUrls: ['./catch-response-form.component.scss']
})
export class CatchResponseFormComponent implements OnInit {
  paramSelected: string = ''
  // dataGroups: any[]
  dataGroupSelected: string = ''
  // colecciones: ColeccionModel[] = []
  // colSelected: ColeccionModel

  // KeySpected: ParamExpected[]

  dataForm: RegistroDatosModel = new RegistroDatosModel('', this.paramSelected, this.dataGroupSelected)

  private _RegistroDatosForm = new BehaviorSubject<RegistroDatosModel>(this.dataForm);
  @Input() set RegistroDatosForm(form: RegistroDatosModel) {this._RegistroDatosForm.next(form);}
  get RegistroDatosForm() {return this._RegistroDatosForm.getValue()}

  @Output() edited = new EventEmitter<RegistroDatosModel>();

  constructor (
      public agente_: CurrentAgentService,
      public currentIntent: CurrentIntentService,
      public _alerts: MxAlert,
      private _cache: MxCache
  ) {
      // this.colSelected = new ColeccionModel('', [])
  }

  async ngOnInit() {
      // this.colecciones = await this._cache.getAsyncKey('colecciones')
      // this._RegistroDatosForm.pipe(
      //     distinctUntilKeyChanged('parametro')
      // ).subscribe(form => {
      //     this.dataForm = form
      //     this.setSaveKeys(form.coleccion)
      // })
  }

  // setSaveKeys(coleccion: string) {
  //     this.colSelected = this.colecciones
  //         .find(col => col.name === coleccion);
  //         console.log(this.colSelected);
  //     if (this.colSelected) {
  //         this.colSelected.saveKeys = !this.colSelected.saveKeys ? []
  //             : this.colSelected.saveKeys
  //     } else {
  //         this.colSelected = new ColeccionModel('', [])
  //     }
  // }

  // catchColSelected(selected: MatSelectChange) {
  //     this.setSaveKeys(selected.value)
  // }

  // validateColeccionOnClick() {
  //     if (this.colecciones.length < 1) {
  //         this._alerts.sendMessageAlert('Debes crear una colección primero')
  //     }
  // }

  // validateKeySpectedOnClick() {
  //     if (this.colSelected.saveKeys.length < 1) {
  //         this._alerts.sendMessageAlert(`Debes agregar palabras claves a la colección ${this.colSelected.name}`)
  //     }
  // }




}
