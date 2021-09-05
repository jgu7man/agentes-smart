import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MxCache } from '@marxa/devkit';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { EntityTypeModel } from 'src/app/models/entity-type.model';
import { EntityTypesService } from 'src/app/services/entitiy-types.service';

@Component({
  selector: 'as-entity-value-selector',
  templateUrl: './entity-value-selector.component.html',
  styleUrls: ['./entity-value-selector.component.scss']
})
export class EntityValueSelectorComponent implements OnInit {

  valueCtrl: FormControl = new FormControl('')
  clases: string[] = [];
  // @Input() tipoDisplayName: string;
  private _displayName : BehaviorSubject<string> = new BehaviorSubject('');
  @Input() set entityTypeDisplayName(name: string) {
    let displayName = name.startsWith('@') ? name.substring(1) : name
    this._displayName.next(displayName);
  }
  get entityTypeDisplayName() { return this._displayName.getValue()}

  @Input() value?: any = ''
  @Output() selected: EventEmitter<string> = new EventEmitter();
  nameSubscription: Subscription

  constructor(
    private _cache: MxCache,
    private _entityTypes: EntityTypesService
  ) {
    this.nameSubscription =
      this._displayName.subscribe((name: string) => {
        if (name) {
          name = name.startsWith('@') ? name.split('@')[1] : name
          this.getClases(name);
        }
      })
  }

  async ngOnInit() {
    if (this.value) {
      this.valueCtrl.setValue(typeof this.value == 'string' ? this.value : '')
    }


  }



  async getClases(name: string) {
    this._entityTypes.list$
      .pipe(take(1))
      .subscribe((list) => {
        const tipoFinded = list.find(t => t.displayName === name)
        this.clases = tipoFinded && 'entities' in tipoFinded ?
          tipoFinded.entities.map(e =>e.value) : []
      });
  }

  onSelected(selected: MatSelectChange) {
    this.selected.emit(selected.value);
  }

  ngOnDestroy() {
    this.nameSubscription.unsubscribe()
  }

}
