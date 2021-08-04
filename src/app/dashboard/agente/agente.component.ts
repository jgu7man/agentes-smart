import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrentAgenteService } from './current-agente.service';
import { CurrentMensajeService } from './mensajes/mensaje/current-mensaje.service';
import { Subscription } from 'rxjs';
import { ContextosService } from './contextos/contextos.service';
import { take } from 'rxjs/operators';
import { AgenteModel } from 'src/app/models/agente.model';
import { MxCache, MxLoading, MxResponsive } from '@marxa/devkit';
import { DashboardService } from 'src/app/services/dashboard.service';
import { iNavlink } from 'src/app/models/navlink.interface';

@Component({
  selector: 'aSmart-agente',
  templateUrl: './agente.component.html',
  styleUrls: ['./agente.component.scss']
})
export class AgenteComponent implements OnInit, OnDestroy {

  public agente!: AgenteModel | null
  public projectId!: string
  private _agenteSubscription!: Subscription

  constructor (
    private _agente: CurrentAgenteService,
    private _cache: MxCache,
    private _route: ActivatedRoute,
    private _router: Router,
    public dashboard_: DashboardService,
    public responsive: MxResponsive,
    public _loading: MxLoading,
    private _contexts: ContextosService
  ) {

    // ANCHOR GET THE CURRENT PROJECT ID
    // NOTE INIZIALITE THE CURRENT AGENT
    this._route.params.subscribe(async params => {
      this._agenteSubscription =
      ( await this._agente.setCurrentAgente(params['id'])
      ).subscribe(() => {
        const url = this._router.url
        if ( url.slice(url.lastIndexOf('/') + 1) == params['id']) {
          this._router.navigate([`/dashboard/agente/${params['id']}/flujo`])
          this._contexts.getAllContexts().pipe(take(1)).subscribe()
        }
      })
    })

  }



  ngOnInit(): void {
    this.loadAgente()
    if ( this.responsive.small ) {
      this.dashboard_.setMobileNavbar(this.agentLinks)
    }

  }



  async loadAgente() {
    this.agente = await this._cache.getAsyncKey<AgenteModel>('currentAgente')
    let projectId = this._cache.getDataKey('projectId')
    if (!this.agente?.started) {
      this._router.navigate([`/dashboard/agente/${ projectId }/start`])
    }
  }

  agentLinks:iNavlink[] = [
    { path: 'filtro', label: 'Filtro', icon: 'fa-filter' },
    { path: 'flujo', label: 'Flujo', icon:'fa-sitemap' },
    { path: 'tipos', label: 'Tipos', icon:'fa-list-alt' },
    // { path: 'configuraciones', label: 'Configuración', icon: 'fa-cog' },
    // { path: 'integraciones', label: 'Integraciones', icon: 'fa-plug' },
    // { path: 'conversasiones', label: 'Conversaciones', icon: 'fa-comment-dots' },

  ]

    ngOnDestroy() {
      this._agente.current = {} as AgenteModel
      this._agente.unsubscribeIntentList()
      // this._agente.firestoreIntentListSubs.unsubscribe()
      if (this._agente.coleccionesSubs)
        this._agente.coleccionesSubs.unsubscribe()
        // this._agente.tiposSubs.unsubscribe()
      if(this._agente.contextosSubs)
        this._agente.contextosSubs.unsubscribe()
      if(this._agente.tarjetasSubs)
        this._agente.tarjetasSubs.unsubscribe()
      this._agenteSubscription.unsubscribe()
    }

}


