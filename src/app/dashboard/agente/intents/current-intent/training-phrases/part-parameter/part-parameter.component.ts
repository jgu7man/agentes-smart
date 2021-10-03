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

  @Input() part!: iPhrasePart;
  @Input() index!: number;

  switchEntitySelector: boolean = false;
  paramNameCtrl: FormControl = new FormControl({value:'', disabled: this.isProductParam})
  param?: iParameter;

  allowAddEntity: boolean = false;
  disableSinonimo: boolean = false;
  synonymExists: boolean = false;


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
    private _entityTypes: EntityTypesService
  ) {}

  ngOnInit(): void {
    if (this.part) {
      this.paramNameCtrl.patchValue(
        this.part.alias == true ? '' : this.part.alias
      )
    }
  }

  onAddEntityType() {
    this._dialog.open(AddEntityTypeComponent, { minWidth: 300, })
      .afterClosed()
      .pipe(take(1))
      .subscribe( ( entityType: EntityTypeModel ) => {
        this.part.entityType = entityType.displayName;
        this.part.alias = ''
      });
  }

  get entityTypeSelected(): EntityTypeModel | undefined {
    const entityTypeList = this._entityTypes.list$.value
    if ( this.part && this.part.entityType ) {
      let entityType = this.part.entityType.startsWith('@')
        ? this.part.entityType.substring(1) : this.part.entityType
      return entityTypeList.find(t => t.displayName == entityType)
    } else return
  }


  onEntityTypeSelected(entityTypeSelected: string) {
    this.part.entityType = entityTypeSelected.startsWith('@')
      ? entityTypeSelected : `@${entityTypeSelected}`
    if (this.part.entityType === '@productos') {
      this.part.alias = 'producto'
      this.paramNameCtrl.patchValue('producto')
    } else {
      this.paramNameCtrl.patchValue( this.part.text )
    }
  }

  get isSystemEntity() {
    return this.part.entityType
      ? this.part.entityType.includes('sys.')
      || this.part.entityType.includes('productos')
      : false
  }

  addParameter() {
    console.log( this.part )
    this.paramAdded.emit(this.part);
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
    const paramDisplayName = this.paramNameCtrl.value

    if ( this.param ) this.part.alias = this.param.displayName = paramDisplayName
    else {
      this.param = {
        displayName: paramDisplayName,
        value: `$${ paramDisplayName }`,
        entityTypeDisplayName: this.part.entityType || '',
      }
    }

    if ( this.param ) {
      this._entityTypes.putEntityOnType(this.param.entityTypeDisplayName, {
        value: paramDisplayName,
        synonyms: [this.part.text]
      })
      this.disableSinonimo = true
    }

    this.addParameter()
  }



  onEntitySelect(entitySelected: string) {
    this.part.alias = this.text.normalize( entitySelected );

    this.param = {
      displayName: this.part.alias,
      entityTypeDisplayName: this.part.entityType as string,
      value: this.part.alias.startsWith('$')
        ? this.part.alias
        : `$${this.part.alias}`
    };

    if ( this.entitySelected$ ) {
      if (!this.entitySelected$.synonyms) this.entitySelected$.synonyms = []

      this.synonymExists = this.entitySelected$.synonyms.some(
        s => s.toLowerCase() == this.part.text.toLowerCase()
      )

      this.addParameter()
      // return this.entitySelected
    }
  }





  get entitySelected$(): iEntity | undefined {
    const entities = this.entityTypeSelected ? this.entityTypeSelected.entities : []
    return entities.find(e => e.value == this.part.alias )
  }

  get synonymStored(): string | undefined {
    const synonyms = this.entitySelected$?.synonyms || []
    return synonyms.find(s => s == this.part.text)
  }

  get addSynonymToolTip():string {
    return this.synonymExists ? 'El sinónimo ya existe, no es necesario agregarlo de nuevo': ''
  }

  get isProductParam() {
    return this.param && this.param.displayName == 'productos' ? true : false
  }

  setSinonimo() {
    console.log( this.part )
    const synonym = this.part.text
    if ( this.part.entityType ) {
      console.log( this.entitySelected$ )
      if ( this.entitySelected$ ) {
        if ( !this.entitySelected$.synonyms ) this.entitySelected$.synonyms = []
        console.log( this.entitySelected$.synonyms.some(s => s === synonym) )
        if (!this.entitySelected$.synonyms.some(s => s === synonym)) {
          this.entitySelected$.synonyms.push(synonym)
          console.log( this.entitySelected$ )
          this._entityTypes.putEntityOnType(this.part.entityType, this.entitySelected$)
          .then(() => this.disableSinonimo = true)
        }
      }

    }

  }

  ngOnDestroy() {
  }

}
