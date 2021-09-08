import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MxCache, MxLoading, MxText } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AddEntityTypeComponent } from 'src/app/dashboard/agente/entity-types/entity-type/add-entity-type/add-entity-type.component';
import { EntityTypeModel, iEntity } from 'src/app/models/entity-type.model';
import { iParameter, iPhrasePart } from 'src/app/models/intent.model';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { EntityTypesService } from 'src/app/services/entitiy-types.service';
import { ParametersService } from 'src/app/services/parameters.service';
import { TrainingPhrasesService } from 'src/app/services/training-phrases.service';

@Component({
  selector: 'as-part-parameter',
  templateUrl: './part-parameter.component.html',
  styleUrls: ['./part-parameter.component.scss']
})
export class PartParameterComponent implements OnInit, OnDestroy {

  @Input() parte!: iPhrasePart;
  @Input() index!: number;

  switchEntitySelector: boolean = false;
  paramNameCtrl: FormControl = new FormControl({value:'', disabled: this.isProductParam})
  param?: iParameter;

  toggleAddClase: boolean = false;
  disableSinonimo: boolean = false;
  synonymExists: boolean = false;

  entitySelected?: iEntity

  @ViewChild('partEntityInput') partEntityInput!: ElementRef;

  @Output() onDelete = new EventEmitter<any>();
  @Output() paramAdded = new EventEmitter<iPhrasePart>();
  @Output() onTipoChange: EventEmitter<iPhrasePart> = new EventEmitter();


  constructor(
    private _params: ParametersService,
    private _loading: MxLoading,
    private _currentIntent: CurrentIntentService,
    public  _frases: TrainingPhrasesService,
    public text: MxText,
    private _dialog: MatDialog,
    private _cache: MxCache,
    private _tipos: EntityTypesService
  ) {}

  ngOnInit(): void {
    if (this.parte) {
      this.paramNameCtrl.patchValue(
        this.parte.alias == true ? '' : this.parte.alias
      )
    }
  }

  onAddTipo() {
    this._dialog
      .open(AddEntityTypeComponent, {
        minWidth: 300,
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((entityType: EntityTypeModel) => {
        this.parte.entityType = entityType.displayName;
      });
  }

  get tipoSelected(): EntityTypeModel | undefined {
    const tiposList = this._tipos.list$.value
    if ( this.parte && this.parte.entityType ) {
      let entityType = this.parte.entityType.startsWith('@')
        ? this.parte.entityType.substring(1) : this.parte.entityType
      return tiposList.find(t => t.displayName == entityType)
    } else return
  }


  onTipoSelected(tipoSelected: string) {
    this.parte.entityType = tipoSelected.startsWith('@')
      ? tipoSelected : `@${tipoSelected}`
    if (tipoSelected === 'productos') {
      this.parte.alias = 'productos'
      this.paramNameCtrl.patchValue('productos')
    } else {
      this.paramNameCtrl.patchValue( this.parte.text )
    }
  }

  get isSystemEntity() {
    return this.parte.entityType
      ? this.parte.entityType.includes('sys.')
      || this.parte.entityType.includes('productos')
      : false
  }

  addParameter() {
    console.log( this.parte )
    this.paramAdded.emit(this.parte);
    this._params.getList()
    .then( list => {
        console.log( this.param?.displayName, list  )
        let paramStored = list.find( ( p ) => p.displayName == this.param?.displayName );
        if (!paramStored && this.param) {
          this._params.add(this.param)
        }
      })
  }

  setNewEntity() {
    console.log( this.param )
    const paramName = this.paramNameCtrl.value

    if ( this.param ) this.parte.alias = this.param.displayName = paramName
    else {
      this.param = {
        displayName: paramName,
        value: `$${ paramName }`,
        entityTypeDisplayName: this.parte.entityType || '',
      }
    }

    if ( this.param ) {
      this._tipos.putEntityOnType(this.param.entityTypeDisplayName, {
        value: paramName,
        synonyms: [this.parte.text]
      })
      this.disableSinonimo = true
    }

    this.addParameter()
  }



  onEntitySelect(entitySelected: string) {
    this.parte.alias = this.text.normalize( entitySelected );

    this.param = {
      displayName: this.parte.alias,
      entityTypeDisplayName: this.parte.entityType as string,
      value: typeof this.parte.alias == 'string' ?
        this.parte.alias.startsWith('$')
          ? this.parte.alias
          : `$${this.parte.alias}`
        : this.parte.entityType?.substring(1) as string
    };

    if ( this.entitySelected$ ) {
      if (!this.entitySelected$.synonyms) this.entitySelected$.synonyms = []
      this.synonymExists = this.entitySelected$.synonyms.some(
        s => s.toLowerCase() == this.parte.text.toLowerCase()
      )

      this.addParameter()
      return this.entitySelected
    } else return ''
  }





  get entitySelected$(): iEntity | undefined {
    const entities = this.tipoSelected ? this.tipoSelected.entities : []
    return entities.find(e => e.value == this.parte.alias )
  }

  get synonymStored(): string | undefined {
    const synonyms = this.entitySelected$?.synonyms || []
    return synonyms.find(s => s == this.parte.text)
  }

  get addSynonymToolTip():string {
    return this.synonymExists ? 'El sinónimo ya existe, no es necesario agregarlo de nuevo': ''
  }

  get isProductParam() {
    return this.param && this.param.displayName == 'productos' ? true : false
  }

  setSinonimo() {
    console.log( this.parte )
    const synonym = this.parte.text
    if ( this.parte.entityType ) {
      console.log( this.entitySelected$ )
      if ( this.entitySelected$ ) {
        if ( !this.entitySelected$.synonyms ) this.entitySelected$.synonyms = []
        console.log( this.entitySelected$.synonyms.some(s => s === synonym) )
        if (!this.entitySelected$.synonyms.some(s => s === synonym)) {
          this.entitySelected$.synonyms.push(synonym)
          console.log( this.entitySelected )
          this._tipos.putEntityOnType(this.parte.entityType, this.entitySelected$)
          .then(() => this.disableSinonimo = true)
        }
      }

    }

  }

  ngOnDestroy() {
  }

}
