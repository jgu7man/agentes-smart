import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { EntityTypeModel, iSystemEntity } from 'src/app/models/entity-type.model';
// import { ConditionalResponseModel, DefaultResponseModel } from 'src/app/models/intent-response.model';
import { iCondition, iResponseCondition } from 'src/app/models/response.model';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { EntityTypesService } from 'src/app/services/entitiy-types.service';
import { ParametersService } from 'src/app/services/parameters.service';

@Component({
  selector: 'as-conditional-response-form',
  templateUrl: './conditional-response-form.component.html',
  styleUrls: ['./conditional-response-form.component.scss']
})
export class ConditionalResponseFormComponent implements OnInit, OnDestroy {

  paramSelected: string = '';
  isOriginal: boolean = true;
  tipoSelected?: EntityTypeModel | iSystemEntity;
  conditionValueCtrl: FormControl = new FormControl( '' )
  valueSubscription: Subscription

  @Input() condition!: iResponseCondition;
  @Output() onChange: EventEmitter<iResponseCondition> = new EventEmitter();
  @Output() onRemove: EventEmitter<void> = new EventEmitter();

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
    private _intent: CurrentIntentService,
    private _entityTypes: EntityTypesService,
  ) {
    this.valueSubscription = this.conditionValueCtrl.valueChanges
      .pipe(debounceTime( 1000 ))
      .subscribe( () => { this.onChange.emit(this.condition)})
  }

  async ngOnInit() {
    if (this.condition.parameter) {
      this.tipoSelected = this._intent
        .entityTypes$
        .getValue()
        .find((t) => t && t.displayName == this.condition.parameter);
    }
  }

  get disableValue() {
    return (
      this.condition.operator == 'existe' ||
      this.condition.operator == 'no_existe' ||
      !this.condition.operator
    );
  }

  setParameter() {
    if (this.condition.parameter) {
      return this.condition.parameter.split('$').length >= 2
        ? this.condition.parameter.split('$')[1].split('.')[0]
        : this.condition.parameter.split('$')[0];
    } else return ''
  }

  async onParamChange(selected: string) {
    console.log( selected )
    let displayName = selected.startsWith('@') ?
      selected.substring(1) : selected

    let paramFound = await this._params.getByName(displayName);
    if (paramFound) {
      this.isOriginal = paramFound.value.split('.').length > 1 ? true : false;
    }
    this.condition.parameter = displayName;
    this.tipoSelected = this._intent.entityTypes$.getValue()
      .find((t) => t && t.displayName == displayName);

    console.log( this.tipoSelected )
    this.onChange.emit(this.condition);
  }

  get isntSystem(): EntityTypeModel | false {
    return this.tipoSelected && 'entities' in this.tipoSelected
    ? this.tipoSelected as EntityTypeModel : false
  }

  validateOriginal() {
    return !this.isOriginal && this.tipoSelected;
  }

  catchValue( value: any ) {
    this.condition.value = value;
    this.onChange.emit(this.condition)
  }

  entitiesOf(entityTypeSelected: EntityTypeModel | iSystemEntity) {
    if ('entities' in entityTypeSelected) {
      return entityTypeSelected.entities;
    } else return []
  }

  ngOnDestroy() {
    this.valueSubscription.unsubscribe()
  }

}
