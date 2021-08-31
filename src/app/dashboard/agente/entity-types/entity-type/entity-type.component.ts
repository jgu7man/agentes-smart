import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MxText } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';
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
      .pipe(debounceTime(1000))
      .subscribe( changes => {
      this.currentEntityType.editDisplayName(changes)
    })
  }

  @Input() set selected(tipo: EntityTypeStateModel) {
    this.currentEntityType.setCurrentTipo(tipo)
      .subscribe(changes => {
        // console.log( changes )
        // this.tipo.saved = false
      })
  }


  async ngOnInit() {
    this.currentEntityType.current$.pipe( take( 1 ) )
      .subscribe( entityType => {
      if ( entityType ) this.displayNameCtrl.patchValue(entityType.body.displayName)
    })
  }


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

  }
  // onDeleteTipo() {
  //   this.tiposService.deleteTipo( this.tipo.name )
  //     .then(()=> {this.tipoDeleted.emit(this.tipo.name)})
  // }
}
