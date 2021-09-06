import { Component, Input, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { iEntityType } from 'src/app/models/entity-type.model';
import { CurrentEntityTypeService } from 'src/app/services/current-entity-type.service';

@Component({
  selector: 'as-entity-state-body',
  templateUrl: './entity-state-body.component.html',
  styleUrls: ['./entity-state-body.component.scss'],
})
export class EntityStateBodyComponent implements OnInit {
  /** Recibe y almacena un tipo */
  @Input() entity!: iEntityType;

  constructor (
    public entity_: CurrentEntityTypeService
  ) { }

  ngOnInit(): void {}

  onAddClase() {
    this.entity_.switchAddClase = true;
  }

  // # SWITCHES OF CURRENT TIPO
  /** Define si el tipo será lista o mapa de sinónimos.
   * @note Se usa en este punto también para controlar los demás componentes hijos
   */
  onKindChange(event: MatCheckboxChange) {
    let tipoState = this.entity_.current$.getValue();
    if ( tipoState ) {
      this.entity = {
        ...this.entity,
        kind: event.checked ? 'KIND_MAP' : 'KIND_LIST',
      };
      this.entity_.current$.next({ ...tipoState, body: this.entity, saved: false });
    }
  }

  /** Define el tipo de expansión */
  onExpantionChange(event: MatCheckboxChange) {
    let tipoState = this.entity_.current$.getValue();
    if ( tipoState ) {
      this.entity = {
        ...this.entity,
        autoExpansionMode: event.checked
          ? 'AUTO_EXPANSION_MODE_DEFAULT'
          : 'AUTO_EXPANSION_MODE_UNSPECIFIED',
      };
      this.entity_.current$.next({ ...tipoState, body: this.entity, saved: false });
    }
  }

  /** Cambia la flexibilidad de palabra */
  onFuzzyChange(event: MatCheckboxChange) {
    let tipoState = this.entity_.current$.getValue();
    if ( tipoState ) {
      this.entity = {
        ...this.entity,
        enableFuzzyExtraction: event.checked ? true : false,
      };
      this.entity_.current$.next({ ...tipoState, body: this.entity, saved: false });
    }
  }
}
