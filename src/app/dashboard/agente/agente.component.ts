import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgenteModel } from 'src/app/models/agent.model';
import { MxCache, MxLoading, MxResponsive } from '@marxa/devkit';
import { DashboardService } from 'src/app/services/dashboard.service';
import { iNavlink } from 'src/app/models/navlink.interface';
import { CurrentAgenteService } from 'src/app/services/current-agent.service';
import { AgentsService } from 'src/app/services/agents.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'aSmart-agente',
  templateUrl: './agente.component.html',
  styleUrls: ['./agente.component.scss']
})
export class AgenteComponent implements OnInit, OnDestroy {

  public agent!: AgenteModel | null
  public projectId!: string
  // private _agenteSubscription!: Subscription

  constructor (
    private _cache: MxCache,
    private _route: ActivatedRoute,
    private _router: Router,
    private _agent: CurrentAgenteService,
    public dashboard: DashboardService,
    public responsive: MxResponsive,
    public loading: MxLoading,
    private _afs: AngularFirestore,
  ) {


    // ANCHOR GET THE CURRENT PROJECT ID
    // NOTE INIZIALITE THE CURRENT AGENT
    this.projectId = this._route.snapshot.params[ 'id' ]
    this.loadAgente()

    if ( this.responsive.small ) {
      this.dashboard.setMobileNavbar(this.agentLinks)
    }
  }



  async ngOnInit() {
    // this.updateAgentDatabase()
  }




  async loadAgente() {
    this.agent = await this._agent.get( this.projectId )
    const url = this._router.url
    if (!this.agent?.started) {
      this._router.navigate( [ `/dashboard/agente/${ this.projectId }/start` ] )
    } else if ( url.slice(url.lastIndexOf('/') + 1) == this.projectId) {
      this._router.navigate([`/dashboard/agente/${this.projectId}/flujo`])
    }
  }

  async updateAgentDatabase() {
    const batch = this._afs.firestore.batch()
    const clientId = this._cache.getDataKey<string>( 'clientId' )
    const projectPath = `usuarios/${ clientId }/agentes/${ this.projectId }`
    const projectRef = this._afs.doc(projectPath).ref

    const clients = await projectRef.collection( 'clientes' ).get()
    await this.loading.asyncForEach( clients.docs, async client => {
      let clientRef = this._afs.doc( `usuarios/${ clientId }/clients/${ client.id }` ).ref
      await batch.set( clientRef, client.data() )
      let conversation = await client.ref.collection( 'conversacion' ).get()
      this.loading.asyncForEach( conversation.docs, async conv => {
        let convRef = clientRef.collection('conversation').doc(conv.id)
        await batch.set( convRef, conv.data() )
        await batch.delete( conv.ref )
        // return
      })
      await batch.delete( client.ref )
      // return
    } )

    const contexts = await projectRef.collection( 'contextos' ).get()
    await this.loading.asyncForEach(contexts.docs, async context => {
      console.log( context.data() )
      await batch.set( projectRef.collection( 'contexts' ).doc( context.id ), context.data() )
      await batch.delete( context.ref )
      // return
    } )

    const entityTypes = await projectRef.collection( 'tipos' ).get()
    await this.loading.asyncForEach(entityTypes.docs,  async entityType => {
      await batch.set( projectRef.collection( 'entityTypes' ).doc( entityType.id ), entityType.data() )
      await batch.delete( entityType.ref )
      // return
    } )

    const params = await projectRef.collection( 'parametros' ).get()
    await this.loading.asyncForEach(params.docs,  async param => {
      await batch.set( projectRef.collection( 'params' ).doc( param.id ), param.data() )
      await batch.delete( param.ref )
      // return
    } )

    const integrations = await projectRef.collection( 'integraciones' ).get()
    await this.loading.asyncForEach(integrations.docs,  async int => {
      await batch.set( projectRef.collection( 'integrations' ).doc( int.id ), int.data() )
      await batch.delete( int.ref )
      // return
    } )

    const conversations = await projectRef.collection( 'conversaciones' ).get()
    await this.loading.asyncForEach(conversations.docs,  async conv => {
      await batch.set( projectRef.collection( 'conversations' ).doc( conv.id ), conv.data() )
      await batch.delete( conv.ref )
      // return
    } )

    const intents = await projectRef.collection( 'mensajes' ).get()
    await this.loading.asyncForEach( intents.docs, async mensaje => {
      console.log( mensaje.data() )
      const intentRef = projectRef.collection( 'intents' ).doc( mensaje.id )
      await batch.set( intentRef, mensaje.data() )
      const responses = await mensaje.ref.collection( 'respuestas' ).get()

      await this.loading.asyncForEach( responses.docs, async response => {
        let responseRef = intentRef.collection( 'responses' ).doc( response.id )
        await batch.set( responseRef, response.data() )
        await batch.delete( response.ref )
        // return
      } )

      await batch.delete( mensaje.ref )
      // return
    })

    await batch.commit()
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


