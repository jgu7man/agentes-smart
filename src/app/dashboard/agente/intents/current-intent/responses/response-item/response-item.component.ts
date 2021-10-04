import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MxAlert, MxCache, MxLoading } from '@marxa/devkit';
import { pull, uniq } from 'lodash';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { iContext, iContextList, iContextSelected } from 'src/app/models/context.model';
import { iResponseType } from 'src/app/models/intent-response.model';
// import { ConditionalResponseModel, iResponseType, ResponseModel, IntentResponseResult, DefaultResponseModel, IntentResponseType, CatchResponseModel, SearchResponseModel } from 'src/app/models/intent-response.model';
import { iIntentState, IntentStateModel } from 'src/app/models/intent.model';
import { iResponseCondition, iResponseResult, ResponseModel } from 'src/app/models/response.model';
import { ContextsService } from 'src/app/services/contexts.service';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { IntentsService } from 'src/app/services/intents.service';
import { ResponsesService } from 'src/app/services/responses.service';
import { AddIntentDialog } from '../../../add-intent/add-intent.dialog';

@Component( {
  selector: 'as-response-item',
  templateUrl: './response-item.component.html',
  styleUrls: [ './response-item.component.scss' ]
} )
export class ResponseItemComponent implements OnInit, OnDestroy {
  /** Resive la data de la respuesta desde el arreglo padre */
  @Input() respuesta: ResponseModel;
  responseType?: iResponseType
  /** Activa la visa para elegir acciones */
  activateAccion: boolean = false;
  /** Activa la opción de editar la respuesta */
  switchEditResp: boolean = false;
  /** Obtiene el tipo de respuesta seleccionado y da estilo a la vista */
  selectedRes?: ResponseModel;
  /** El mensaje de salida */
  public result: iResponseResult;
  /** Almacena el contexto y permite que se muestre la lista de contextos */
  public currentContext: string;
  /** Almacena la lista de contextos del cache */
  public contextLists!: iContextList;
  public contextNameList: string[] = [];
  public nuevoContexto?: iContext;
  public nextMensajesList: iIntentState[] = [];
  public sugerenciasActivated: boolean = false;
  /** Notifica al componente padre que se ha borrado una respuesta */
  @Output() onDelete: EventEmitter<string> = new EventEmitter();
  @Output() opened: EventEmitter<void> = new EventEmitter();

  switchAddIntent: boolean = false;
  intentSubscription: Subscription

  @ViewChild( 'respuestaCard' ) public ownElement!: ElementRef

  constructor (
    public respuestas_: ResponsesService,
    private _alerts: MxAlert,
    private _loading: MxLoading,
    private _cache: MxCache,
    public contextos_: ContextsService,
    private _dialog: MatDialog,
    private _intent: CurrentIntentService,
    private _intents: IntentsService,
    private _afs: AngularFirestore,
  ) {
    this.result = { response: '', suggestions: [] };
    this.intentSubscription =
      this._intent.state$.subscribe( async mensaje => {
        this.contextLists = await this._cache.getDataKey<any>( 'contextosLists' );
        await this.setNextIntents( this.currentContext );
      } )
    this.currentContext = this._cache.getDataKey<string>( 'currentContexto' ) || ''
    this.respuesta = new ResponseModel( this.result, 0 );
  }


  async ngOnInit() {
    if ( this.respuesta.result[ 'suggestions' ] ) {
      if ( this.respuesta.result[ 'suggestions' ].length )
        this.sugerenciasActivated = true;
    }

  }

  updateType() {
    const projectId = this._cache.getDataKey( 'projectId' )
    const userId = this._cache.getDataKey( 'userId' )
    const intentId = this._cache.getDataKey( 'intentId' )
    const path = `usuarios/${ userId }/agentes/${ projectId }/intents/${ intentId }`;
    this._afs.doc( `${ path }/responses/${ this.respuesta.id }` )
      .update({...this.respuesta})
  }


  emitOpened() {
    this.switchEditResp = true
    this.opened.emit()
  }

  async setNextIntents( currentContext?: string ) {
    // console.log( this.contextLists )
    if ( this.contextLists ) {
      // Set first intent of every context
      this.nextMensajesList = [];
      var lists = Object.keys( this.contextLists );
      await this._loading.asyncForEach( lists, async ( contextName ) => {
        var contextList: any[] = this.contextLists[ contextName ];
        if ( contextList[ 0 ] ) {
          this.nextMensajesList.push( contextList[ 0 ] );
        }
      } );

      // Set intents related to current context
      if ( currentContext ) {
        var currentList: any[] = this.contextLists[ currentContext ];
        const current = this._intent.state$.getValue();
        var currentIntentIndex = currentList.findIndex(
          ( i ) => i.displayName === current?.intent.displayName
        );
        // console.log(currentIntentIndex)
        // Set next intent in the context
        if ( currentList[ currentIntentIndex + 1 ] ) {
          this.nextMensajesList.push( currentList[ currentIntentIndex + 1 ] );
        }
        // Set previus intent in the context
        if ( currentList[ currentIntentIndex - 1 ] ) {
          this.nextMensajesList.push( currentList[ currentIntentIndex - 1 ] );
        }
        // Set current intent
        this.nextMensajesList.push( currentList[ currentIntentIndex ] );
      }

      //  Set uncontext intents
      this._intents.list$.pipe( take( 1 ) ).subscribe( async intents => {
        if ( intents && intents.length > 0 ) {
          await this._loading.asyncForEach( intents, ( intent: IntentStateModel ) => {
            let intentStored = this.nextMensajesList.find(
              ( i ) => i.displayName === intent.displayName
            );
            if (
              intent.displayName != 'Default Context Intent' &&
              intent.displayName != 'Default Fallback Intent' &&
              !intentStored
            )
              this.nextMensajesList.push( intent );
          } );
        } else {
          this.nextMensajesList = [];
        }

      } )
      // console.log( this.nextMensajesList )
    }
  }

  get activeContextSelector() {
    if (this.currentContext) {
      return false;
    } else return false
  }

  get isBienvenida() {
    let intentState = this._intent.state$.getValue()
    return intentState?.intent.displayName == 'Default Welcome Intent'
  }

  get activeIntentSelector() {
    if (!this.currentContext) {
      return false;
    } else {
      return true;
    }
  }

  toggleAsdefault(change: MatSlideToggleChange) {
    this.respuesta.asDefault = change.checked;
  }

  async catchInputContext(selected: iContextSelected) {
    const contextName = selected.context;

    if (contextName) {
      if (!this.respuesta.inputContexts) {
        this.respuesta.inputContexts = [];
      }
      if (!this.respuesta.outputContexts) {
        this.respuesta.outputContexts = [];
      }

      let prevContext = this.respuesta.inputContexts[0]
      this.respuesta.inputContexts = [contextName]

      this.respuesta.outputContexts = uniq([
        contextName,
        ...this.respuesta.outputContexts.filter(c =>
          c != prevContext
        ),
      ])
    } else {
      if ( this.respuesta.inputContexts && this.respuesta.inputContexts.length > 0 ) {
        const prevContext = this.respuesta.inputContexts[ 0 ] || ''
        if (!this.respuesta.outputContexts) this.respuesta.outputContexts = []
        this.respuesta.inputContexts = []
        this.respuesta.outputContexts = uniq([
          ...pull(this.respuesta.outputContexts, prevContext),
          ...this.respuesta.outputContexts
        ])

      }
    }

    console.log( this.respuesta.outputContexts )
  }

  addCondition() {
    if (!this.respuesta.conditions) this.respuesta.conditions = []
    this.respuesta.conditions.push( { parameter: '', operator: '', value: '' })
  }

  updateConditions( condition: iResponseCondition, index: number ) {
    this.respuesta.conditions![index] = condition
  }

  removeCondition( index: number ) {
    this.respuesta.conditions?.splice(index, 1)
  }

  async catchOutputContext(selected: iContextSelected) {
    const contextName = selected.context;
    if (contextName) {
      if (!this.respuesta.outputContexts) {
        this.respuesta.outputContexts = [];
      }
      this.respuesta.outputContexts.push(contextName);

      // Search for nextIntentList
      if (!this.nextMensajesList || this.nextMensajesList.length < 1) {
        this.respuesta.nextIntent = '*fin';
      }
    } else {
      console.log( this.contextLists )
      // this.respuesta.nextIntent = '*fin';
    }
    console.log(this.respuesta.outputContexts)
    return this.respuesta;
  }

  setPrevContextSelected(contexts?: string[]) {
    var context: string = '';
    if (contexts && contexts.length > 0) {
      if (this.contextLists) {
        contexts.forEach((c) => {
          if (c in this.contextLists) context = c;
        });
      }
    }
    return context;
  }



  async setNextContext(nextIntent: string) {
    var nextIntentContext: string | undefined;

    nextIntentContext = Object.keys( this.contextLists ).find( contextName => {
      let intentFinded = this.contextLists[contextName].find(
        (intent) => intent.displayName == nextIntent
      )
      return intentFinded ? intentFinded.contexto : undefined
    })

    return nextIntentContext || '';
  }

  async setNextIntentContext(change: MatSelectChange) {
    var allIntents = await this._intents.list$.pipe( take( 1 )).toPromise()
    var intentSelected = allIntents.find((i) => i.displayName === change.value);
    if (intentSelected) {
      this.respuesta.outputContexts = [];
      if (!this.respuesta.inputContexts) this.respuesta.inputContexts = []

      this.respuesta.outputContexts = [
        ...intentSelected.intent.inputContextNames.map((c) =>
          c.slice(c.lastIndexOf('/') + 1)
        ).filter(c => !this.respuesta.inputContexts?.includes(c)),
        ...this.respuesta.inputContexts
      ];
    } else {
      this.respuesta.outputContexts = []
    }
    console.log( this.respuesta.outputContexts )
  }

  openAddIntent() {
    const dialog = this._dialog.open(AddIntentDialog, {
      width: '450px',
      // minHeight: 450
    });

    dialog.afterClosed().subscribe((newIntent) => {
      console.log( newIntent )
      this.nextMensajesList.push(newIntent);
    });
  }

  /**
   * Obtiene el tipo de respuesta seleccionado del select
   * @param {MatSelectChange} tipoSelected - Contiene la propidad valor que es de tipo `TipoEntityType.name`
   */


  /** Recibe los cambios en los formularios hijos como simple, CODICIONAL, BUSCAR Y GRUPO DE DATOS */
  catchResult(msg: any) {
    this.result = msg;
  }

  /**
   * Valida la respuesta que se ha de guardar en FIRESTORE
   *
   * @param {ResponseModel} response Objeto de respuesta modelado como RespuestaModel
   * @returns {ResponseModel} Respuesta como objeto sin tipo declarado
   */
  async validateRespuesta(response: ResponseModel) {
    let nextIntentContext = await this.setNextContext(response.nextIntent || '')
    const responses = await this.respuestas_.getList()

    if ( !response.outputContexts ||
      response.outputContexts.length == 0
    ) {
      response.outputContexts = [nextIntentContext];
    }
    // else {
    //   respuestaObj.outputContexts.push(nextIntentContext)
    // }
    if (response.asDefault) {
      var defaultStored = responses.filter((r) => r.asDefault);
      if (defaultStored.length > 1) {
        this._alerts.message(
          'No puedes asignar dos respuestas como "Default"'
        );
      }
    } else response.asDefault = false

    console.log( response, this.result  )
    response.result = { ...this.result };
    // let text = output.text || response.result.text
    // console.log( text )
    console.log( response.result )

    if (!response.result.response) {
      throw this._alerts.message('Agrega al menos un mensaje de texto');
    } else if ( response.result[ 'suggestions' ]
      && response.result[ 'suggestions' ].length == 1 ) {
      throw this._alerts.message(
        'Agrega 2 o más sugerencias o desactiva las sugerencias'
      );
    } else {

      console.log( response )
      return response;
    }
  }

  /**
   * Valida y envía la respuesta a guardarse en el servicio de respuestas y prepara nuevamente las variables para una respuesta nueva
   *
   */
  async onSave() {
    // console.log(this.respuesta.nextIntent);
    this.respuesta.outputContexts;
    console.log( this.respuesta )
    let cleanRespuesta = await this.validateRespuesta(this.respuesta);
    if (!cleanRespuesta['nextIntent']) {
      cleanRespuesta['nextIntent'] = '*sug';
    }
    // console.log(cleanRespuesta['nextIntent']);
    this.switchEditResp = false;

    if (cleanRespuesta) await this.respuestas_.set(cleanRespuesta);
    // this.respuesta.tipo = undefined;
    // this.respuesta.result = new DefaultResponseModel('');
  }

  ngOnDestroy() {
    if (this.intentSubscription) this.intentSubscription.unsubscribe()
  }

  /** Lista de tipo de respuestas con sus respectivos estilos */
  typeResponses: iResponseType[] = [
    {
      display: '',
      type: undefined,
      color: 'grey',
      icono: 'fa-plus'
    },
    {
      display: 'Default',
      type: 'default',
      color: '#935cff',
      icono: 'fa-comment-alt',
    },
    {
      display: 'Condicional',
      type: 'conditional',
      color: '#42cbff',
      icono: 'fa-code-branch',
    },
    {
      display: 'Guarda datos',
      type: 'catch',
      color: '#26a69a',
      icono: 'fa-clipboard-list',
    },
    {
      display: 'Buscar',
      type: 'search',
      color: '#eadb51',
      icono: 'fa-search',
    },
    // {
    //     display: 'Sugerencias',
    //     name: 'suggests',
    //     color: '#f44336',
    //     icono: 'fa-list-ul',
    // },
  ];

}
