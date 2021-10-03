import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { EntityTypeModel, EntityTypeStateModel, iEntity, iEntityType, iEntityTypeState } from 'src/app/models/entity-type.model';
import { EntityTypesService } from 'src/app/services/entitiy-types.service';
import { MxAlert, MxCache } from '@marxa/devkit';
import { EntityComponent } from '../../entity-types/entity-type/entity/entity.component';
import { CurrentEntityTypeService } from 'src/app/services/current-entity-type.service';
import { Router } from '@angular/router';

@Component({
  selector: 'as-start-entity-types',
  templateUrl: './start-entity-types.component.html',
  styleUrls: ['./start-entity-types.component.scss'],
})
export class StartEntityTypesComponent implements OnInit, OnDestroy {
  entityType?: iEntityType;
  entityState!: EntityTypeStateModel
  // @ViewChild('editInput') editInput!: ElementRef;
  // @ViewChildren(EntityComponent)
  // ClaseItemList!: QueryList<EntityComponent>;
  // switchAddClase: boolean = false;
  // clases: iEntity[] = [];
  // @Output() tipoAdded = new EventEmitter<any>();

  // switchEditTipo: boolean = false;
  // newClaseItem: string = '';
  // ClaseInput: boolean = false;
  // tiposSubcription!: Subscription;

  constructor (
    public entityTypes: EntityTypesService,
    private currentEntityType: CurrentEntityTypeService,
    private _alert: MxAlert,
    private _router: Router
  ) {
    this.entityType = this.entityTypes.list$.value.find( t => t.displayName == 'palabrasclave' )
    if ( !this.entityType ) {
      this._alert.error( 'No se pudo encontrar la entityType de palabrasclave, favor de eliminar este agente y crearlo de nuevo', 'start-entity-types#constructor' )
      this._router.navigate(['/dashboard'])
    } else {
      this.entityState = new EntityTypeStateModel(this.entityType)
      this.currentEntityType.setCurrentTipo( this.entityState )
    }
    console.log( this.entityTypes.list$.value )
  }

  async ngOnInit() {
    // this.tiposSubcription = this.tipos_.listen()
    //   .pipe(debounceTime(1000))
    //   .subscribe((tipos) => {
    //     if (tipos.length > 0) {
    //       let palabrasClave = tipos.find(
    //         (t) => t.displayName == 'palabrasclave'
    //       );
    //       if (palabrasClave) {
    //         this.entityType = palabrasClave;
    //       }
    //     }
    //   });
  }

  onSave() {
    this.currentEntityType.onSave()
  }

  // async toEditClase(id: string) {
  //   // this.edited.emit(this.tipo)
  //   const claseToEdit = this.ClaseItemList.find(
  //     (claseItem) => claseItem.claseId == id
  //   );
  // }

  // onKindChange(event: MatCheckboxChange) {
  //   this.entityType.kind = event.checked ? 'KIND_MAP' : 'KIND_LIST';
  // }

  // onExpantionChange(event: MatCheckboxChange) {
  //   this.entityType.autoExpansionMode = event.checked
  //     ? 'AUTO_EXPANSION_MODE_DEFAULT'
  //     : 'AUTO_EXPANSION_MODE_UNSPECIFIED';
  // }

  // onFuzzyChange(event: MatCheckboxChange) {
  //   this.entityType.enableFuzzyExtraction = event.checked ? true : false;
  // }

  // onAddClase(event: any) {
  //   event.target.blur();
  //   event.stopPropagation();
  //   let clase = { value: this.newClaseItem };
  //   this.newClaseItem = '';
  //   this.entityType.entities.push(clase);
  // }

  onDelClase(claseIndex: number) {
    // this.entityType.entities.splice(claseIndex, 1);
  }

  ngOnDestroy() {
    // this.tiposSubcription.unsubscribe();
  }
}
