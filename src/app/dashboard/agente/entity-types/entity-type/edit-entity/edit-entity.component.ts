import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { iEntity } from 'src/app/models/entity-type.model';
import { COMMA, TAB } from '@angular/cdk/keycodes';
import { CurrentEntityTypeService } from 'src/app/services/current-entity-type.service';
import { MxLoading, MxText } from '@marxa/devkit';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'as-edit-entity',
  templateUrl: './edit-entity.component.html',
  styleUrls: ['./edit-entity.component.scss']
})
export class EditEntityComponent implements OnInit, OnDestroy {

  /** Activa la vista de sinónimos */
  switchSinonimosInput: boolean = false;
  /** Controlador del campo de valor de la clase */
  newClaseItem: string = '';
  /** Controlador del campo de sinónimos de la clase */
  newClaseSinonimos: string[] = [];
  /** Define el tipo de activadores de separación en el "Chips Field" */
  readonly separatorKeysCodes: number[] = [COMMA, TAB];
  /** Recibe la clase en cuestión */
  @Input() clase!: iEntity;
  /** Recibe el la configuración del tipo */
  // @Input() kind: 'KIND_MAP' | 'KIND_LIST' | "KIND_REGEXP" = 'KIND_MAP';
  /** Controlador del "Chips Filed" */
  @ViewChild('sinonimosInput') sinonimosInput!: ElementRef;
  /** Emite cuando la clase se editó, agregó o borró */
  @Output() public claseDone = new EventEmitter<boolean>();

  constructor(
    public tipo_: CurrentEntityTypeService,
    private _loading: MxLoading,
    private _text: MxText
  ) {

  }

  ngOnInit(): void {
    this.setInitValues()
  }

  /** Establece los valores de entrada */
  setInitValues() {
    if (this.clase) {
      this.newClaseItem = this.clase.value;
      this.newClaseSinonimos = this.clase.synonyms ? this.clase.synonyms : [];
      if (this.clase.synonyms && this.clase.synonyms.length > 0) {
        this.switchSinonimosInput = true;
      }
    }
  }

  /** Evita espacios en blanco en el valor de la clase */
  delSpaces(e:any) {
    this._text.normalize(this.newClaseItem);
    if (e.which === 32) {
      this.newClaseItem.valueOf().replace(/\s/g, '');
      return false;
    } else return true;
  }

  // # ADD CLASE (Component)
  /** Resetea los campos para uno nuevo y envía la clase creada a la creación de un item de lista o un mapa de sinónimos */
  onAddClase(event:any) {
    event.stopPropagation();

    // Define la clase y prepara la siguiente
    if (this.newClaseItem) {
      this.clase = { value: this.newClaseItem };
      this.newClaseItem = '';
    }

    // Si es lista o si es mapa
    // if (this.kind == 'KIND_MAP') {
      // Desactiva el agregado de clase
      this.tipo_.switchAddClase = false
      // Define la clase nueva para continuar con la edición
      this.tipo_.activatedToEdit = this.clase.value
      // Agrega la clase nueva como sinónimo también
      this.tipo_.setSinonimo(
        this.clase,
        this.clase.value,
        'add'
      );
    // } else {
    //   this.tipo_.setClase(this.clase);
    // }
  }

  /** Cierra la edición de la clase y resetea los campos */
  async setClase() {
    this.claseDone.emit(true);
    this.newClaseItem = '';
    this.newClaseSinonimos = [];
  }

  /** Agrega sinónimo del "chips field" */
  addSinonimo(event: MatChipInputEvent) {
    if (event.value) {
      this.tipo_.setSinonimo( this.clase, event.value.trim(), 'add');
    }
    event.input.value = '';
  }

  /** Elimina sinónimo del "chips field" */
  delSinonimo(sinonimo: string) {
    const index = this.newClaseSinonimos.findIndex((sin) => sin === sinonimo);
    this.newClaseSinonimos.splice(index, 1);
    this.tipo_.setSinonimo(this.clase, sinonimo, 'del');
  }

  /** Deja los campos en blanco de nuevo */
  ngOnDestroy() {
    this.newClaseItem = ''
    this.newClaseSinonimos = []
  }

}
