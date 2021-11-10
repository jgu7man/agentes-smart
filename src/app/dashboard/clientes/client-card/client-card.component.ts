import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinct, first } from 'rxjs/operators';
import { iClient } from 'src/app/models/agent-clients.model';
import { ClientesService } from 'src/app/services/clientes.service';
import { ClientFormDialog } from '../client-form/client-form.dialog';
import { DeleteClientDialog } from '../delete-client/delete-client.dialog';

@Component({
  selector: 'as-client-card',
  templateUrl: './client-card.component.html',
  styleUrls: ['./client-card.component.scss']
})
export class ClientCardComponent implements OnInit, OnDestroy {

  private _cid : BehaviorSubject<string> = new BehaviorSubject('');
  @Input() set cid(id: any) { this._cid.next(id); }
  get cid() { return this._cid.getValue() }

  cliente?: iClient
  defaultAvatar = '/assets/icons/user-icon-256x256.png'

  @Output() deleted: EventEmitter<boolean> = new EventEmitter()

  private _clientSubscription?: Subscription
  constructor (
    private _clients: ClientesService,
    private _dialog: MatDialog
  ) {
  }

  async ngOnInit() {
    this._cid.pipe(distinct()).subscribe( cid => {
      console.log( cid )
      if ( cid ) {
        this.cid = cid
        this._clientSubscription =
        this._clients.getByCID( cid ).subscribe( data => {
          this.cliente = data
        })
      }
    })
  }

  openEdit() {
    this._dialog.open( ClientFormDialog, {
      data: this.cliente
    })
  }

  openDelete() {
    this._dialog.open( DeleteClientDialog, {
      data: this.cliente?.clientId
    } ).afterClosed().pipe( first() ).subscribe( confirm => {
      if (confirm) this.deleted.emit(true)
    })
  }

  ngOnDestroy() {
    if(this._clientSubscription) this._clientSubscription.unsubscribe()
  }
}
