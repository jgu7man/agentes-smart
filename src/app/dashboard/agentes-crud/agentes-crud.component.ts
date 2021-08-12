import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MxAlert, MxCache } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { AgentsService } from 'src/app/services/agents.service';
import { DeleteAgenteDialog } from './delete-agente/delete-agente.dialog';

@Component({
  selector: 'as-agentes-crud',
  templateUrl: './agentes-crud.component.html',
  styleUrls: ['./agentes-crud.component.scss']
})
export class AgentesCrudComponent implements OnInit, OnDestroy {

  private listSubscription!: Subscription;

  constructor (
    public agents: AgentsService,
    private _alerts: MxAlert,
    private _router: Router,
    private _dialog: MatDialog,
    private _cache: MxCache
  ) {}

  async ngOnInit() {
    this.listSubscription =
      this.agents.list$.subscribe( list => {
      console.log( list )
      if (list.length > 0) {
        this._router.navigate(['/dashboard/agente/', list[0].projectId])
      } else {
        this._router.navigate(['/dashboard/crear_agente'])
      }
    })
  }

  onSelectAgent(projectId: string):void {
    this._cache.updateData( 'projectId', projectId )
    this._router.navigate(['/dashboard/agente/', projectId])
  }


  deleteAgent( projectId: string ) {
    this._dialog.open( DeleteAgenteDialog ).afterClosed().pipe( take( 1 ) )
      .subscribe( confirmation => {
        if ( confirmation ) {
          this.agents.delete( projectId )
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
