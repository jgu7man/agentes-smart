import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MxCache, MxLoading, MxText } from '@marxa/devkit';
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
export class PartParameterComponent implements OnInit {

  @Input() parte!: iPhrasePart;
  @Input() index!: number;

  switchEntitySelector: boolean = false;
  paramName: any = '';
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
    private _mensaje: CurrentIntentService,
    public  _frases: TrainingPhrasesService,
    private _text: MxText,
    private _dialog: MatDialog,
    private _cache: MxCache,
    private _tipos: EntityTypesService
  ) {}

  ngOnInit(): void {
    if (this.parte) {
      this.paramName = this.parte.alias == true ? '' : this.parte.alias;
    }
  }

  // async toSelectTipo() {
  //   this.switchEntitySelector = true;
  //   await this._loading.waitFor(100);
  //   // this.partEntityInput.nativeElement.focus()
  // }

  reformatText(event: any) {
    // listen keypress event; not keydown o keyup
    var k;
    k = event.charCode; // k = event.keyCode;  (Both can be used)
    return (
      (k > 64 && k < 91) || // allow letters
      (k >= 48 && k <= 57) || // allow numbers
      (k > 96 && k < 123) || // allow numpads
      k == 8 // allow backspace
      // || k == 32  // allow space
      // || k == 188 // allow comma
      // || k == 189 // allow dash
      // || k == 190 // allow perdiod (dot)
      // || k == 95 // allow underscore
    );
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
      this.parte.alias = this.paramName = 'productos'
    } else {
      this.paramName = this.parte.text
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
      const paramStored = this._mensaje.current$.value.intent.parameters
        .find( ( p ) => p.displayName == this.param?.displayName );

      // console.log( paramStored )
      if (!paramStored) {
        this._params.addParam(this.param)
      }
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

  setCustomParam( value: string ) {
    if (this.param) this.parte.alias = this.param.displayName = value
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

}
