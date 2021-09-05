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

  private paramNameSubscription!: Subscription;

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
    this.paramNameSubscription =
    this.paramNameCtrl.valueChanges.subscribe( changes => {
      if (this.param) this.parte.alias = this.param.displayName = changes
    })
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

    this.addParameter()
    // this.tipoSelected.emit(this.parte);
  }

  get isSystemEntity() {
    return this.parte.entityType
      ? this.parte.entityType.includes('sys.')
      || this.parte.entityType.includes('productos')
      : false
  }

  addParameter() {
    if ( this.parte.entityType ) {

      this.param = {
        displayName: this.parte.entityType.substring(1),
        entityTypeDisplayName: this.parte.entityType,
        value: typeof this.parte.alias == 'string' ?
          this.parte.alias.startsWith('$')
            ? this.parte.alias
            : `$${this.parte.alias}`
          : this.parte.entityType.substring(1)
      };
      // console.log( this.parte )
      this.paramAdded.emit(this.parte);
      this._params.getList()
        .then( list => {
          let paramStored = list.find( ( p ) => p.displayName == this.param?.displayName );
          if (!paramStored && this.param) {
            this._params.add(this.param)
          }
        })

        // console.log( paramStored )
    }
  }

  setNewEntity() {
    if ( this.param ) {
      this._tipos.putEntityOnType(this.param.displayName, {
        value: this.parte.text,
        synonyms: [this.parte.text]
      })
      this.disableSinonimo = true
    }
  }

  get entitySelected$() {
    const entities = this.tipoSelected ? this.tipoSelected.entities : []
    return entities.find(e => e.value == this.parte.alias )
  }

  onEntitySelect(entitySelected: string) {
    this.parte.alias = entitySelected;
    if ( this.entitySelected$ ) {
      if (!this.entitySelected$.synonyms) this.entitySelected$.synonyms = []
      this.synonymExists = this.entitySelected$.synonyms.some(
        s => s.toLowerCase() == this.parte.text.toLowerCase()
      )

      this.addParameter()
      return this.entitySelected
    } else return ''
  }

  get addSynonymToolTip():string {
    return this.synonymExists ? 'El sinónimo ya existe, no es necesario agregarlo de nuevo': ''
  }

  get isProductParam() {
    return this.param && this.param.displayName == 'productos' ? true : false
  }

  setSinonimo() {
    const synonym = this.parte.text
    if ( this.parte.entityType ) {
      if ( this.entitySelected ) {
        if (!this.entitySelected.synonyms) this.entitySelected.synonyms = []
        if (!this.entitySelected.synonyms.some(s => s === synonym)) {
          this.entitySelected.synonyms.push(synonym)
          console.log( this.entitySelected )
          this._tipos.putEntityOnType(this.parte.entityType, this.entitySelected)
          .then(() => this.disableSinonimo = true)
        }
      }

    }

  }

  ngOnDestroy() {
    this.paramNameSubscription.unsubscribe()
  }

}
