import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MxText } from '@marxa/devkit';
import { timer } from 'rxjs';
import { Subscription } from 'rxjs';
import { debounceTime, distinct, distinctUntilChanged, skipUntil, take } from 'rxjs/operators';
import { EntityTypeStateModel } from 'src/app/models/entity-type.model';
import { CurrentEntityTypeService } from 'src/app/services/current-entity-type.service';
import { EntityTypesService } from 'src/app/services/entitiy-types.service';

@Component({
  selector: 'as-entity-type',
  templateUrl: './entity-type.component.html',
  styleUrls: ['./entity-type.component.scss']
})
export class EntityTypeComponent implements OnInit, OnDestroy {


  /** Emits on close panel request or after save */
  @Output() closePanel = new EventEmitter<any>();
  displayNameCtrl: FormControl = new FormControl( '', [ Validators.required ] )
  displayNameSubs!: Subscription

  constructor(
    public entityTypes: EntityTypesService,
    public currentEntityType: CurrentEntityTypeService,
    public text: MxText
  ) {
    this.displayNameSubs = this.displayNameCtrl.valueChanges
      .pipe(
        debounceTime( 1000 ),
        skipUntil(timer(1100))
    ).subscribe( changes => {
      this.currentEntityType.editDisplayName(changes)
    })
  }

  @Input() set selected(entityType: EntityTypeStateModel) {
    this.currentEntityType.setCurrentTipo( entityType )
    this.displayNameCtrl.setValue( entityType.body.displayName )
  }


  async ngOnInit() {}


  async onSave() {
    await this.currentEntityType.onSave()
  }

  onClose() {
    // this.tipo_.resetCurrent();
    this.closePanel.emit();
  }

  async delete(entityTypeName: string) {
    // let url = `/dahsboard/agente/${this.projectId}/`;
    await this.entityTypes.deleteTipo(entityTypeName);
    // this._router
    //   .navigateByUrl(url, { skipLocationChange: true })
    //   .then(() => this._router.navigate([url + 'tipos']));
  }


  ngOnDestroy() {
    this.displayNameSubs.unsubscribe()
  }
  // onDeleteTipo() {
  //   this.tiposService.deleteTipo( this.tipo.name )
  //     .then(()=> {this.tipoDeleted.emit(this.tipo.name)})
  // }
}
