import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EntityTypeModel, iSystemEntity } from 'src/app/models/entity-type.model';
import { CondicionalModel, iCondition, SimpleModel } from 'src/app/models/intent-response.model';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { ParametersService } from 'src/app/services/parameters.service';

@Component({
  selector: 'as-conditional-response-form',
  templateUrl: './conditional-response-form.component.html',
  styleUrls: ['./conditional-response-form.component.scss']
})
export class ConditionalResponseFormComponent implements OnInit {

  paramSelected: string = '';
  isOriginal: boolean = true;
  tipoSelected?: EntityTypeModel | iSystemEntity ;

  @Input() result: CondicionalModel;
  @Output() onRespChanges: EventEmitter<CondicionalModel> = new EventEmitter();

  condicionesList: iCondition[] = [
    { displayText: 'igual a', operator: 'igual' },
    { displayText: 'diferente a ', operator: 'diferente' },
    { displayText: 'existe', operator: 'existe' },
    { displayText: 'no existe', operator: 'no_existe' },
    { displayText: 'mayor que', operator: 'mayor' },
    { displayText: 'menor que ', operator: 'menor' },
    { displayText: 'mayor o igual que', operator: 'mayor_igual' },
    { displayText: 'menor o igual que', operator: 'meno_igual' },
  ];

  constructor(
    // public respuestas_: RespuestasService,
    public _params: ParametersService,
    private _mensaje: CurrentIntentService
  ) {
    this.result = new CondicionalModel('', '', '');
  }

  async ngOnInit() {
    if (this.result.parametro) {
      this.tipoSelected = this._mensaje
        .intentTypeEntities$
        .getValue()
        .find((t) => t && t.displayName == this.result.parametro);
    }
  }

  get disableValue() {
    return (
      this.result.condicion == 'existe' ||
      this.result.condicion == 'no_existe' ||
      !this.result.condicion
    );
  }

  setParameter() {
    if (this.result.parametro) {
      return this.result.parametro.split('$').length >= 2
        ? this.result.parametro.split('$')[1].split('.')[0]
        : this.result.parametro.split('$')[0];
    } else return ''
  }

  onParamChange(selected: string) {
    console.log( selected )
    let displayName = selected.startsWith('@') ?
      selected.substring(1) : selected

    let paramFound = this._params.getParamByName(displayName);
    if (paramFound) {
      this.isOriginal = paramFound.value.split('.').length > 1 ? true : false;
    }
    this.result.parametro = displayName;
    // var selectedSplit = selected.value.split('$');
    // console.log( selectedSplit )
    // var param = selectedSplit.length > 1 ? selectedSplit[1] : selectedSplit[0];
    // console.log( param )
    // console.log( this._mensaje.mensajeTypeEntities$.getValue() )
    this.tipoSelected = this._mensaje.intentTypeEntities$.getValue()
      .find((t) => t && t.displayName == displayName);

    console.log( this.tipoSelected )
    this.onRespChanges.emit(this.result);
  }

  get isntSystem() {
    return this.tipoSelected && 'entities' in this.tipoSelected
    ? this.tipoSelected as EntityTypeModel : false
  }

  validateOriginal() {
    return !this.isOriginal && this.tipoSelected;
  }

  async catchresult(msg: SimpleModel) {
    this.result.text = msg.text;
    // await this._loading.waitFor(100)
    this.onRespChanges.emit(this.result);
  }

  entitiesOf(entityTypeSelected: EntityTypeModel | iSystemEntity) {
    if ('entities' in entityTypeSelected) {
      return entityTypeSelected.entities;
    } else return []
  }

}
