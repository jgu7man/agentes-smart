import { CardResponseComponent } from './card-response/card-response.component';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  RespuestaModel,
  SimpleModel,
} from 'src/app/models/intent-response.model';
import { RespuestasService } from 'src/app/services/respuestas.service';
import { MxLoading } from '@marxa/devkit';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { ResponseItemComponent } from './response-item/response-item.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'as-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.scss'],
})
export class ResponsesComponent implements OnInit, OnDestroy {
  /** Respuestas obtenidas de la función de obtener respuestas */
  respuestasList: RespuestaModel[] = [];
  /** Modelo de inicio para crear una nueva respuesta simple */
  newOutputMensaje: SimpleModel;
  /** Suscripción a los cambios de la lista de respuestas */
  respuestasChangesSubs!: Subscription;
  /** Lista de componentes de respuestas */
  @ViewChildren(ResponseItemComponent) cards!: QueryList<ResponseItemComponent>;

  openedCard?: number;

  emptyResponse?: RespuestaModel;

  @Output() lastPositionChange = new EventEmitter<number>();

  constructor(
    public responses: RespuestasService,
    private _loading: MxLoading,
    public currentIntent: CurrentIntentService
  ) {
    this.newOutputMensaje = new SimpleModel('', []);
    // this._respuestas.getDataForRespuestas();
  }

  ngOnInit(): void {
    this.respuestasChangesSubs = this.responses.onRespuestasChanged.subscribe(
      () => {
        this.newOutputMensaje = new SimpleModel('', []);
      }
    );
  }

  /**
   * Crea una nueva respuesta en el arreglo de respuestas para iniciar
   * con la creación de la misma y la abre por defecto
   */
  async addRespuesta() {
    let lastIndex = (await this.responses.getList()).length;

    this.emptyResponse =
      new RespuestaModel(this.newOutputMensaje, lastIndex, '*fin', undefined),

    await this._loading.waitFor( 500 );
    this.cards.last.switchEditResp = true;
    let lastPosition = this.cards.last.ownElement.nativeElement.offsetTop;
    this.lastPositionChange.emit(lastPosition);
    // window.scrollTo(lastPosition)
  }

  public deleteRespuesta(responseId: string) {
    if (responseId) {
      this.responses.delRespuesta(responseId);
    }
  }

  cancelAddResponse() {
    delete this.responses.emptyResponse
  }

  onOpened(index: number) {
    this.openedCard = index;
  }

  async drop(event: CdkDragDrop<RespuestaModel[]>) {
    let respuestas = await this.responses.getList()
    moveItemInArray(respuestas, event.previousIndex, event.currentIndex);
    this.responses.updateRespuestasOrder(respuestas);
  }

  /** Se desuscribe de los cambios en la lista de respuestas */
  ngOnDestroy() {
    this.respuestasChangesSubs.unsubscribe();
  }
}
