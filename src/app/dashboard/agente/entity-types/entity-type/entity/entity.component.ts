import { EventEmitter, Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { iEntity } from 'src/app/models/entity-type.model';
import { CurrentEntityTypeService } from 'src/app/services/current-entity-type.service';

@Component({
  selector: 'as-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss']
})
export class EntityComponent implements OnInit {

  /** Recibe y establece la configuración de la vista, si es edición o lectura */
  @Input() activateEdit: boolean = false
  /** Recibe la clase que se mostrará o editará */
  private _claseId : BehaviorSubject<string> = new BehaviorSubject('');
  @Input() set claseId(id: string) { this._claseId.next(id); }
  get claseId() { return this._claseId.getValue()}
  /** Recibe y establece el tipo de vista de lista a mapa */
  @Input() kind: 'KIND_MAP' | 'KIND_LIST' = 'KIND_MAP';
  /** Emite evento cuando la clase fue editada */
  @Output() claseEdited = new EventEmitter<iEntity>();
  /** Emite evento cuando la clase fue borrada */
  @Output() claseDeleted = new EventEmitter<boolean>();
  /** Emite evento cuando la clase se cerró */
  @Output() closeClase = new EventEmitter<boolean>();
  /** Almacena la clase filtrada por id */
  public clase!: iEntity | null;

  constructor(
    public currentEntityType: CurrentEntityTypeService
  ) {
    this._claseId.subscribe(id => {
      this.clase = this.currentEntityType.getClase(this.claseId)
    })
  }

  ngOnInit(): void {

  }

  // # onClaseDone
  /** Cuando la clase es dejada de usar por tab, enter o desenfocar, define si será editada o sólo cerrada */
  onClaseDone() {
    this.currentEntityType.activatedToEdit = undefined
    this.currentEntityType.switchAddClase = false
  }

  // # onDeleteClase
  /** Atiende el llamdao de borrado */
  onDelClase() {
    this.currentEntityType.deleteClase( this.claseId).then(() => {
      this.claseDeleted.emit(true);
    });
  }

}
