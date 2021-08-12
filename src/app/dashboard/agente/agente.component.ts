import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgenteModel } from 'src/app/models/agent.model';
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
  // private _agenteSubscription!: Subscription

  constructor (
    private _cache: MxCache,
    private _route: ActivatedRoute,
    private _router: Router,
    public dashboard: DashboardService,
    public responsive: MxResponsive,
    public loading: MxLoading,
  ) {

    // ANCHOR GET THE CURRENT PROJECT ID
    // NOTE INIZIALITE THE CURRENT AGENT
    this.projectId = this._route.snapshot.params['id']
    const url = this._router.url
    if ( url.slice(url.lastIndexOf('/') + 1) == this.projectId) {
      this._router.navigate([`/dashboard/agente/${this.projectId}/flujo`])
    }
  }



  ngOnInit(): void {
    this.loadAgente()
    if ( this.responsive.small ) {
      this.dashboard.setMobileNavbar(this.agentLinks)
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
      // this._agente.current = {} as AgenteModel
      // this._agente.unsubscribeIntentList()
      // // this._agente.firestoreIntentListSubs.unsubscribe()
      // if (this._agente.coleccionesSubs)
      //   this._agente.coleccionesSubs.unsubscribe()
      //   // this._agente.tiposSubs.unsubscribe()
      // if(this._agente.contextosSubs)
      //   this._agente.contextosSubs.unsubscribe()
      // if(this._agente.tarjetasSubs)
      //   this._agente.tarjetasSubs.unsubscribe()
      // this._agenteSubscription.unsubscribe()
    }

}


