import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { iClient } from 'src/app/models/agent-clients.model';
import { iAgentInteraction } from 'src/app/models/interactions.model';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'as-client-conversation',
  templateUrl: './client-conversation.component.html',
  styleUrls: ['./client-conversation.component.scss']
})
export class ClientConversationComponent implements OnInit {

  cid?: string;
  conversation$?: Observable<iAgentInteraction[]>

  constructor (
    private _clients: ClientesService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this._route.params.subscribe( async params => {
      this.cid = params[ 'cid' ]
      console.log( this.cid )
      if ( this.cid ) {
        this.conversation$ = this._clients.listenConversation( this.cid )
      }

    })
  }

  ngOnInit(): void {
  }

  afterDeleted() {
    this._router.navigate(['/dashboard/clientes']);
  }

}
