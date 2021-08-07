import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MensajesService } from '../mensajes/mensajes.service';
import { IntentModel, MensajeModel } from '../mensajes/mensaje.model';
import { GdevCache } from '../../../../../gdev-tools/src/lib/cache/gdev-cache.service';
import { ContextoModel } from './contexto.model';
// import { CurrentAgenteService } from '../current-agente.service';
import { debounceTime, distinctUntilKeyChanged, filter, map, tap } from 'rxjs/operators';
import { GdevAlert } from '../../../../../gdev-tools/src/lib/alert/alert.service';
import { GdevLoading } from '../../../../../gdev-tools/src/lib/loading/loading.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { GdevColor } from '../../../../../gdev-tools/src/lib/color/gdev-color.service';
import { TiposService } from '../tipos/tipos.service';
import { TipoEntidadModel } from '../tipos/tipo.model';
import { CurrentMensajeService } from '../mensajes/mensaje/current-mensaje.service';
import { GdevText } from 'src/app/gdev-tools/src/lib/text/gdev-text.service';
import { CurrentTipoService } from '../tipos/tipo/current-tipo.service';

@Injectable({
  providedIn: 'root',
})
export class ContextosService {
  /** Ruta de los mensajes para acciones del CRUD */
  private contextosPath;
  /** Contexto actualizado optenido de la ruta */
  currentContexto: string;
  /** Consulta de los contextos de la base de datos */
  contextQuery$: Subject<ContextoModel> = new Subject();
  /** Lista actualizada de los contextos en orden de aparición (index) */
  list: ContextoModel[];
  list$: Observable<ContextoModel[]>;

  constructor(
    // private _agente: CurrentAgenteService,
    private _alerts: GdevAlert,
    private _cache: GdevCache,
    private _color: GdevColor,
    // private _currentMensaje: CurrentMensajeService,
    private _mensajes: MensajesService,
    private _text: GdevText,
    private _tipos: TiposService,
    private _tipo: CurrentTipoService,
    private afs: AngularFirestore,
    private _loading: GdevLoading
  ) {
    // Obtiene el contexto de la ruta actual
    this._loading.getRouteQueryParams().subscribe((queryParams) => {
      this.currentContexto = queryParams['contexto'];
    });
  }

  /** Obtiene constante actualizado la ruta del mensaje en curso para los métodos del CRUD */
  private async contextosCollection() {
    const agentePath = this._cache.getDataKey('agentePath');
    this.contextosPath = agentePath + '/contextos';
    const contextosRef = this.afs.collection(this.contextosPath).ref;
    return contextosRef;
  }

  // SECTION CRUD de contextos

  // CREATE

  async setContext(contexto: ContextoModel) {
    try {
      contexto.color = this._color.generateHSLcolor(50, 50);
      this.list = this._cache.getDataKey<ContextoModel[]>('contextos');
      const contextName = contexto.contextName;
      console.log(this.list);

      Object.keys(contexto).forEach((key) => {
        if (contexto[key] == undefined) delete contexto[key];
      });

      // Contexto nuevo
      if (!contexto.id) {
        let contextFinded = this.list.find(
          (context) => context.contextName === contextName
        );

        console.log(!contextFinded);

        // Agrega contexto nuevo
        if (!contextFinded) {
          contexto.contextName = this._text
            .normalize(contexto.contextName)
            .toLowerCase();

          let contextNuevo = await (await this.contextosCollection()).add(
            contexto
          );
          contextNuevo.update({ id: contextNuevo.id });
          contexto.id = contextNuevo.id;

          await this._mensajes.setContextMensaje(contextName);
          // await this._tipos.setContextType(contextName);

          // Contexto duplicado
        } else {
          this._alerts.sendMessageAlert('Contexto duplicado');
        }

        // Actualiza contexto
      } else {
        // Crea un nuevo contexto
        await (await this.contextosCollection())
          .doc(contexto.id)
          .update(contexto);
      }

      // this._agente.getContextosList();
      return contexto;
    } catch (error) {
      console.error(error);
      this._alerts.sendError('Error al crear el nuevo contexto', error);
    }
  }

  // READ
  /** Obtiene el contexto en curso de la session storage */
  async getCurrentContexto() {
    if (!this.currentContexto) {
      this.currentContexto = await this._cache.getDataKey('currentContexto');
      if (!this.currentContexto) return '';
    }
    return this.currentContexto;
  }

  async getOneContext(contexto: ContextoModel) {
    var contextDoc = await (await this.contextosCollection())
      .doc(contexto.id)
      .get();
    var contextGeted: ContextoModel = contextDoc.data() as ContextoModel;
    return contextGeted;
  }

  // READ ALL

  /** Se suscribe para optener todos los contexto del agente en curso */
  private subscribeAllContext: Subscription;

  /** Escucha todos los contextos en tiempo real */
  getAllContexts(): Observable<any> {
    this.list$ = this._cache.listenForChanges<ContextoModel[]>('contextos')
    .pipe(filter(list => !!list))


    const agentePath = this._cache.getDataKey('agentePath');
    this.contextosPath = agentePath + '/contextos';
    return this.afs.collection<ContextoModel>(this.contextosPath,
      ref => ref.orderBy('index', 'asc')
    ).valueChanges().pipe(
      debounceTime(1000),
      tap((list => {
        console.log( 'contextos cargados', list )
        this._cache.updateData('contextos', list)
      }))
    )
  }

  /** Se desuscribe cunado la vista de contextos no está en pantalla */
  unsubscribeAllContext() {
    // this.subscribeAllContext.unsubscribe()
  }

  // UPDATE Index

  /** Actualiza el orden de los contextos en la vista de contextos */
  async updateIndex(contextos: ContextoModel[]) {
    const batch = this.afs.firestore.batch()
    await this._loading.asyncForEach(contextos,
      async ({ id, index }) => {
      batch.update(await (await this.contextosCollection())
        .doc(id),{index});
    });
    batch.commit()
  }

  // DELETE

  async delContext(context: ContextoModel) {
    await this.deleteContextFromMensajes(context);
    await this.deleteContextFromIntent(context.contextName);
    await this.deleteContextFromTipo(context.contextName);
    await (await this.contextosCollection()).doc(context.id).delete();

    console.log('Context deleted');
    return;
  }

  private deleteContextFromIntent(context: string) {
    const intentList = this._cache.getDataKey<IntentModel[]>('intents');
    const contextIntent = intentList.find(
      (i) => i.displayName === 'Default Context Intent'
    );

    contextIntent.parameters = contextIntent.parameters.map((c) => {
      if (c.displayName !== context) return c;
    });

    contextIntent.trainingPhrases = contextIntent.trainingPhrases.map((t) => {
      if (t.parts[0].text !== context) return t;
    });

    // this._currentMensaje.update(contextIntent);
    return;
  }

  private async deleteContextFromTipo(context: string) {
    const tiposList = await this._cache.getDataKey<TipoEntidadModel[]>(
      'contextos'
    );
    const contextType = tiposList.find((c) => c.displayName === context);
    if (contextType) {
      contextType.entities = contextType.entities.map((entity) => {
        if (entity.value != context) return entity;
      });
      await this._tipo.updateTipo(contextType);
      console.log('Entities list updated');
    }
    return;
  }

  private async deleteContextFromMensajes(context: ContextoModel) {
    const agentePath = this._cache.getDataKey('agentePath');
    var mensajesPath = agentePath + '/mensajes';
    const mensajeRef = this.afs.collection(mensajesPath).ref;

    this._mensajes.getMensajesListByContexto(context).then((mensajes) => {
      if (mensajes.length > 0) {
        mensajes.forEach((mensaje: IntentModel) => {
          let contextToDel = mensaje.contextos.findIndex(
            (ent) => ent === context.id
          );

          mensaje.contextos.splice(contextToDel, 1);
          mensajeRef
            .doc(mensaje.name)
            .set({ contextos: mensaje.contextos }, { merge: true });
        });

        console.log('Intents updated');
      }
    });

    return;
  }

  setContextosList(contextName: string, list: MensajeModel[]) {
    let contextosLists = this._cache.getDataKey('contextosLists');
    let agentContextos = this._cache.getDataKey<ContextoModel[]>('contextos');

    if (!contextosLists) contextosLists = { [contextName]: list };
    else contextosLists[contextName] = list;
    if (agentContextos)
      Object.keys(contextosLists).forEach((name) => {
        let contexto = agentContextos.find((c) => c.contextName == name);
        if (!contexto) delete contextosLists[name];
      });

    this._cache.updateData('contextosLists', contextosLists);
  }
}
