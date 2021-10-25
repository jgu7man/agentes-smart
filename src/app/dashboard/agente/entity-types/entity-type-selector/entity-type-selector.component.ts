import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MxCache, MxLoading } from '@marxa/devkit';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SystemEntitiesService } from 'src/app/admin/utils/system-entities.service';
import { EntityTypesService } from 'src/app/services/entitiy-types.service';

@Component({
  selector: 'as-entity-type-selector',
  templateUrl: './entity-type-selector.component.html',
  styleUrls: ['./entity-type-selector.component.scss']
})
export class EntityTypeSelectorComponent implements OnInit, OnDestroy{

  @Input() value?: string = '';
  @Input() id?: string | true;

  tipos: string[] = [];
  tipoControl = new FormControl();
  tiposFiltered!: Observable<string[]>;
  listSubscription!: Subscription;

  @Output() tipoSelected = new EventEmitter<string>();

  constructor(
    private _tipos: EntityTypesService,
    private _loading: MxLoading,
    private _cache: MxCache,
    private _sysEntities: SystemEntitiesService
  ) {}

  async ngOnInit() {
    // si el selector tiene valor
    if (this.value) {
      this.tipoControl.setValue(this.value);
    }
    // NOTE Hacer que esto espere la carga de todo
    await this.getTipo();
    this.tiposFiltered = this.tipoControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value)),
    );
  }

  async getTipo() {
    await this._loading.waitFor(2000)
    this.listSubscription = this._tipos.list$.pipe(
      startWith([]),
      map<any[], any[]>(list => list ? list.map(t => t.displayName) : []),
    ).subscribe((list) => { this.tipos = list });
    // this._tipos.getTiposList();
  }

  private _filter(value: string): string[] {
    if (value === '@' || value.includes('sys')) {
      let sys = this._sysEntities.systemEntities
        .map(e => e.displayName)
      this.tipos = this.tipos.concat(sys)
    }
    const filterValue = value.toLowerCase();
    return this.tipos.filter((tipo) =>
      tipo.toLowerCase().includes(filterValue)
    );
  }

  onTipoSelected(event: MatAutocompleteSelectedEvent) {
    // console.log( event.option.value )
    if (event.option) this.tipoSelected.emit(event.option.value);
  }

  ngOnDestroy() {
    if (this.listSubscription) this.listSubscription.unsubscribe()
  }

}
