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
  @Input() tipo!: iEntityType;

  constructor (
    public tipo_: CurrentEntityTypeService
  ) { }

  ngOnInit(): void {}

  onAddClase() {
    this.tipo_.switchAddClase = true;
  }

  // # SWITCHES OF CURRENT TIPO
  /** Define si el tipo será lista o mapa de sinónimos.
   * @note Se usa en este punto también para controlar los demás componentes hijos
   */
  onKindChange(event: MatCheckboxChange) {
    let tipoState = this.tipo_.current$.getValue();
    if ( tipoState ) {
      this.tipo = {
        ...this.tipo,
        kind: event.checked ? 'KIND_MAP' : 'KIND_LIST',
      };
      this.tipo_.current$.next({ ...tipoState, body: this.tipo, saved: false });
    }
  }

  /** Define el tipo de expansión */
  onExpantionChange(event: MatCheckboxChange) {
    let tipoState = this.tipo_.current$.getValue();
    if ( tipoState ) {
      this.tipo = {
        ...this.tipo,
        autoExpansionMode: event.checked
          ? 'AUTO_EXPANSION_MODE_DEFAULT'
          : 'AUTO_EXPANSION_MODE_UNSPECIFIED',
      };
      this.tipo_.current$.next({ ...tipoState, body: this.tipo, saved: false });
    }
  }

  /** Cambia la flexibilidad de palabra */
  onFuzzyChange(event: MatCheckboxChange) {
    let tipoState = this.tipo_.current$.getValue();
    if ( tipoState ) {
      this.tipo = {
        ...this.tipo,
        enableFuzzyExtraction: event.checked ? true : false,
      };
      this.tipo_.current$.next({ ...tipoState, body: this.tipo, saved: false });
    }
  }
}
