import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatDrawer } from '@angular/material/sidenav';
import { MxLoading } from '@marxa/devkit';
import { SystemEntitiesService } from 'src/app/admin/utils/system-entities.service';
import { EntityTypeStateModel, iEntityTypeState } from 'src/app/models/entity-type.model';
import { CurrentAgentService } from 'src/app/services/current-agent.service';
import { CurrentEntityTypeService } from 'src/app/services/current-entity-type.service';
import { EntityTypesService } from 'src/app/services/entitiy-types.service';
import { AddEntityTypeComponent } from './entity-type/add-entity-type/add-entity-type.component';
import { EntityTypeComponent } from './entity-type/entity-type.component';

@Component({
  selector: 'as-entity-types',
  templateUrl: './entity-types.component.html',
  styleUrls: ['./entity-types.component.scss']
})
export class EntityTypesComponent implements OnInit, OnDestroy {

  /** Lista de los componentes generados por el ngFor */
  @ViewChildren(EntityTypeComponent) public tiposList!: QueryList<EntityTypeComponent>
  /** Panel deslizble que muestra el tipo seleccionado */
  @ViewChild('currentTipo') public tipoDrawer!: MatDrawer
  /** List selector que organiza los tipos */
  @ViewChild( 'listPanel' ) public listPanel!: MatSelectionList
  /** Tipo selected by the list panel */
  public tipoSelected?: EntityTypeStateModel


  constructor (
    public tipos_: EntityTypesService,
    public agente_: CurrentAgentService,
    public systemEntities_: SystemEntitiesService,
    private _tipo: CurrentEntityTypeService,
    private _dialog: MatDialog,
    private _loading: MxLoading,
  ) {

   }

  ngOnInit(): void {
  }

  onSelected( selected: MatSelectionListChange ) {
    if (this.tipoDrawer.opened) { this.tipoDrawer.close() }
    this.tipoSelected = new EntityTypeStateModel( selected.option.value )
    console.log( this.tipoSelected )
    this.tipoDrawer.open()
  }


  openAdd() {
    var dialog = this._dialog.open( AddEntityTypeComponent, {
      minWidth: 300
    } )

    dialog.afterClosed()
      .subscribe((newTipo) => {
      if (newTipo) {
        // this._tipo.resetCurrent()
        this.tipoSelected = newTipo
        this.tipoDrawer.open()
      }
    })
  }

  onClose(): void {
    this.tipoDrawer.close()
    this.listPanel.deselectAll()
    delete this.tipoSelected
  }

  ngOnDestroy() {
    this.tipos_.unsubscribe()
    delete this.tipoSelected
  }

}
