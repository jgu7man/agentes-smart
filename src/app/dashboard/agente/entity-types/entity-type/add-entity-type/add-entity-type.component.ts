import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MxText } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { EntityTypeModel } from 'src/app/models/entity-type.model';
import { EntityTypesService } from 'src/app/services/entitiy-types.service';

@Component({
  selector: 'as-add-entity-type',
  templateUrl: './add-entity-type.component.html',
  styleUrls: ['./add-entity-type.component.scss']
})
export class AddEntityTypeComponent implements OnInit, OnDestroy {
  /** Almacena el nuevo tipo en blanco */
  // public newTipo: EntityTypeModel;
  public displayNameCtrl: FormControl = new FormControl( '', [Validators.required]);
  private dialgoSubs!: Subscription;

  constructor(
    private dialog: MatDialogRef<AddEntityTypeComponent>,
    private _tipos: EntityTypesService,
    public text: MxText
  ) {
  }

  ngOnInit(): void {
    // Se suscribe al llamado de ser cerrado este Dialog cuando existe un error
    this.dialgoSubs = this._tipos.closeCreateDialog
      .subscribe(() => this.dialog.close() );
  }

  /** Deja todo en blanco y cierra el `MatDialog` */
  cancel() {
    this.dialog.close();
  }

  /** Hace el llamado a la API para crear el tipo */
  async onAddTipo() {
    this._tipos.create(this.displayNameCtrl.value)
      .then((newTipo) => {
        this.dialog.close(newTipo);
      })
      .catch((error) => {
        console.error(error);
        this.dialog.close()
      })
  }



  ngOnDestroy() {
    this.dialgoSubs.unsubscribe();
  }
}
