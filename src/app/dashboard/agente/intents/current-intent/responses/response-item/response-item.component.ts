import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MxAlert, MxCache, MxLoading } from '@marxa/devkit';
import { pull, uniq } from 'lodash';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { iContext, iContextList, iContextSelected } from 'src/app/models/context.model';
import { ConditionalResponseModel, iResponseType, ResponseModel, ResultResponse, DefaultResponseModel, ResponseType, CatchResponseModel, SearchResponseModel } from 'src/app/models/intent-response.model';
import { iIntentState, IntentStateModel } from 'src/app/models/intent.model';
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
  public result: ResultResponse;
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
    this.result = new DefaultResponseModel( '' );
    this.intentSubscription =
      this._intent.state$.subscribe( async mensaje => {
        this.contextLists = await this._cache.getDataKey<any>( 'contextosLists' );
        await this.setNextIntents( this.currentContext );
      } )
    this.currentContext = this._cache.getDataKey<string>( 'currentContexto' ) || ''
    this.respuesta = new ResponseModel( this.result, 0, '*fin', 'default', [] );
  }

  oldTipos: Map<string, ResponseType> = new Map( [
    [ 'simple', 'default' ],
    [ 'buscar', 'search' ],
    [ 'condicional', 'conditional' ],
    [ 'grupo_datos', 'catch' ],
  ])
  async ngOnInit() {
    if ( this.respuesta.result[ 'suggestions' ] ) {
      if ( this.respuesta.result[ 'suggestions' ].length )
        this.sugerenciasActivated = true;
    }

    let nuevo = this.oldTipos.get( this.respuesta.tipo as string )
    if ( nuevo ) {
      this.respuesta.tipo  = nuevo
      // this.updateType()
    }

    this.responseType = this.typeResponses.find(
      ( tipo ) => tipo.type == this.respuesta.tipo
    );
  }

  updateType() {
    const projectId = this._cache.getDataKey( 'projectId' )
    const userId = this._cache.getDataKey( 'userId' )
    const intentId = this._cache.getDataKey( 'intentId' )
    const path = `usuarios/${ userId }/agentes/${ projectId }/intents/${ intentId }`;
    this._afs.doc( `${ path }/responses/${ this.respuesta.id }` )
      .update({...this.respuesta})
  }

  validateResult(response: ResponseModel) {
    if ( 'parametro' in response.result )
      return response.result as ConditionalResponseModel
    else
      return response.result as DefaultResponseModel
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

  isConditional( result: ResultResponse ): false | ConditionalResponseModel {
    return 'parametro' in result ? result as ConditionalResponseModel : false
  }

  isCatch( result: ResultResponse ): false | CatchResponseModel {
    return 'parametro' in result ?  result as CatchResponseModel : false
  }

  isSearch( result: ResultResponse ): false | SearchResponseModel {
    return 'parametro' in result ? result as SearchResponseModel : false
  }

  isDefault( result: ResultResponse ): false | DefaultResponseModel {
    return 'text' in result ? result as DefaultResponseModel : false
  }

    get activeContextSelector() {
      if (this.respuesta.tipo == 'default') {
        return true;
      } else if (this.currentContext) {
        return false;
      } else return false
    }

    get isBienvenida() {
      let intentState = this._intent.state$.getValue()
      return intentState?.intent.displayName == 'Default Welcome Intent'
    }

    get activeIntentSelector() {
      if (this.respuesta.tipo == 'default') {
        return false;
      } else if (this.respuesta.tipo == 'suggests') {
        return false;
      } else if (!this.currentContext) {
        return false;
      } else {
        return true;
      }
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

    disableEScondition() {
      return this.respuesta.result['condicion' as keyof ResultResponse] == 'no existe' || this.respuesta.result['condicion' as keyof ResultResponse] == 'existe'
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
        this.nextMensajesList.push(newIntent);
      });
    }

    /**
     * Obtiene el tipo de respuesta seleccionado del select
     * @param {MatSelectChange} tipoSelected - Contiene la propidad valor que es de tipo `TipoEntityType.name`
     */
    onTipoSelected(tipoSelected: MatSelectChange) {
      // let simpleStored = this._mensaje.respuestasList$.filter(
      //     (r) => r.tipo == 'default'
      // );
      // if (tipoSelected.value == 'default' && simpleStored.length > 1) {
      //     console.log(this._mensaje.respuestasList, tipoSelected.value);
      //     this._alerts.sendMessageAlert(
      //         'No puedes agregar más de una respuesta simple'
      //     );
      // } else {
      this.responseType = this.typeResponses.find( ( t ) => t.type == tipoSelected.value );
      console.log( this.responseType )
      if ( this.responseType) this.respuesta.tipo = this.responseType.type;
      // }
    }

    /** Recibe los cambios en los formularios hijos como simple, CODICIONAL, BUSCAR Y GRUPO DE DATOS */
    catchResult(msg: any) {
      this.result = msg;
    }

    /**
     * Valida la respuesta que se ha de guardar en FIRESTORE
     *
     * @param {ResponseModel} respuestaObj Objeto de respuesta modelado como RespuestaModel
     * @returns {ResponseModel} Respuesta como objeto sin tipo declarado
     */
    async validateRespuesta(respuestaObj: ResponseModel) {
      let nextIntentContext = await this.setNextContext(respuestaObj.nextIntent || '')
      if (
        !respuestaObj.outputContexts ||
        respuestaObj.outputContexts.length == 0
      ) {
        respuestaObj.outputContexts = [nextIntentContext];
      }
      // else {
      //   respuestaObj.outputContexts.push(nextIntentContext)
      // }
      const responses = await this.respuestas_.getList()
      if (respuestaObj.result.asDefault) {
        var defaultStored = responses.filter((r) => r.result.asDefault);
        if (defaultStored.length > 1) {
          this._alerts.message(
            'No puedes asignar dos respuestas como "Default"'
          );
        }
      }

      let respuestaClean
      let output:ResultResponse = { ...respuestaObj.result, ...this.result };
      let respuesta = output.text;

      if (!respuesta && respuestaObj.tipo != 'search') {
        throw this._alerts.message('Agrega al menos un mensaje de texto');
      } else if (output['suggestions'] && output['suggestions'].length == 1) {
        throw this._alerts.message(
          'Agrega 2 o más sugerencias o desactiva las sugerencias'
        );
      } else {
        var respuestaKeys = Object.keys(respuestaObj);
        await this._loading.asyncForEach(respuestaKeys, (key) => {
          if ( respuestaObj[ key as keyof ResponseModel] === undefined )
            delete respuestaObj[ key as keyof ResponseModel];
          return;
        });

        respuestaClean = { ...respuestaObj };
        respuestaClean['result'] = output;

        return respuestaObj;
      }
    }

    /**
     * Valida y envía la respuesta a guardarse en el servicio de respuestas y prepara nuevamente las variables para una respuesta nueva
     *
     */
    async onSave() {
      // console.log(this.respuesta.nextIntent);
      this.respuesta.outputContexts;
      let cleanRespuesta = await this.validateRespuesta(this.respuesta);
      if (!cleanRespuesta['nextIntent']) {
        cleanRespuesta['nextIntent'] = '*sug';
      }
      // console.log(cleanRespuesta['nextIntent']);
      this.switchEditResp = false;

      if (cleanRespuesta) this.respuestas_.set(cleanRespuesta);
      this.respuesta.tipo = undefined;
      this.respuesta.result = new DefaultResponseModel('');
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
        display: 'Simple',
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
        display: 'Grupo de datos',
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
