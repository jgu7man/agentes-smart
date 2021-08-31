import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MxCache } from '@marxa/devkit';
import { IntentStateModel } from 'src/app/models/intent.model';

@Component({
  selector: 'as-intent-breadcums',
  templateUrl: './intent-breadcums.component.html',
  styleUrls: ['./intent-breadcums.component.scss']
})
export class IntentBreadcumsComponent implements OnInit {

  mensajes: IntentStateModel[] = []
  context: string | null
  @Input() intentIndex!: number
  constructor (
    private _cache: MxCache,
    private _route: ActivatedRoute,
  ) {
    this.context = this._route.snapshot.queryParamMap.get( 'contexto' )
  }

  async ngOnInit() {
    if ( this.context ) {

      let contextLists = this._cache.getDataKey<any>( 'contextosLists' )
      if (contextLists) this.mensajes = contextLists[ this.context ];
    }
  }

}
