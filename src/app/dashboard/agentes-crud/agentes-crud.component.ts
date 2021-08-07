import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MxAlert } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { AgentesService } from 'src/app/services/agentes.service';
import { DeleteAgenteDialog } from './delete-agente/delete-agente.dialog';

@Component({
  selector: 'as-agentes-crud',
  templateUrl: './agentes-crud.component.html',
  styleUrls: ['./agentes-crud.component.scss']
})
export class AgentesCrudComponent implements OnInit, OnDestroy {

  private listSubscription!: Subscription;

  constructor (
    public agentes_: AgentesService,
    private _alerts: MxAlert,
    private _router: Router,
    private _dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.listSubscription =
      this.agentes_.list$.subscribe( list => {
      console.log( list )
      if (list.length > 0) {
        this._router.navigate(['/dashboard/agente/', list[0].projectId])
      } else {
        this._router.navigate(['/dashboard/crear_agente'])
      }
    })
  }


  deleteAgente( projectId: string ) {
    this._dialog.open( DeleteAgenteDialog ).afterClosed().pipe( take( 1 ) )
      .subscribe( confirmation => {
        if ( confirmation ) {
          this.agentes_.delete( projectId )
            .pipe(first()).subscribe(() =>
              this._alerts.notify('Agente Eliminando')
            )
        }
    })
  }

  ngOnDestroy() {
    this.listSubscription.unsubscribe()
  }

}
