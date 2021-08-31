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
import { EntityTypeModel, iEntity } from 'src/app/models/entity-type.model';
import { EntityTypesService } from 'src/app/services/entitiy-types.service';
import { MxCache } from '@marxa/devkit';
import { EntityComponent } from '../../entity-types/entity-type/entity/entity.component';

@Component({
  selector: 'as-start-entity-types',
  templateUrl: './start-entity-types.component.html',
  styleUrls: ['./start-entity-types.component.scss'],
})
export class StartEntityTypesComponent implements OnInit, OnDestroy {
  tipo: EntityTypeModel;
  @ViewChild('editInput') editInput!: ElementRef;
  @ViewChildren(EntityComponent)
  ClaseItemList!: QueryList<EntityComponent>;
  switchAddClase: boolean = false;
  clases: iEntity[] = [];
  @Output() tipoAdded = new EventEmitter<any>();

  switchEditTipo: boolean = false;
  newClaseItem: string = '';
  ClaseInput: boolean = false;
  tiposSubcription!: Subscription;

  constructor (
    public tipos_: EntityTypesService,
    private _cache: MxCache
  ) {
    this.tipo = new EntityTypeModel( 'palabrasclave', [], 'KIND_LIST');
  }

  async ngOnInit() {
    this.tiposSubcription = this.tipos_.listen()
      .pipe(debounceTime(1000))
      .subscribe((tipos) => {
        if (tipos.length > 0) {
          let palabrasClave = tipos.find(
            (t) => t.displayName == 'palabrasclave'
          );
          if (palabrasClave) {
            this.tipo = palabrasClave;
          }
        }
      });
  }

  onSave() {
    console.log(this.tipo);
    this.tipos_.createTipoContextos(this.tipo).then(() => {
      this.tipoAdded.emit();
    });
  }

  async toEditClase(id: string) {
    // this.edited.emit(this.tipo)
    const claseToEdit = this.ClaseItemList.find(
      (claseItem) => claseItem.claseId == id
    );
  }

  onKindChange(event: MatCheckboxChange) {
    this.tipo.kind = event.checked ? 'KIND_MAP' : 'KIND_LIST';
  }

  onExpantionChange(event: MatCheckboxChange) {
    this.tipo.autoExpansionMode = event.checked
      ? 'AUTO_EXPANSION_MODE_DEFAULT'
      : 'AUTO_EXPANSION_MODE_UNSPECIFIED';
  }

  onFuzzyChange(event: MatCheckboxChange) {
    this.tipo.enableFuzzyExtraction = event.checked ? true : false;
  }

  onAddClase(event: any) {
    event.target.blur();
    event.stopPropagation();
    let clase = { value: this.newClaseItem };
    this.newClaseItem = '';
    this.tipo.entities.push(clase);
  }

  onDelClase(claseIndex: number) {
    this.tipo.entities.splice(claseIndex, 1);
  }

  ngOnDestroy() {
    this.tiposSubcription.unsubscribe();
  }
}
