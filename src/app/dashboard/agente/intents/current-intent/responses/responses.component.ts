import { CardResponseComponent } from './card-response/card-response.component';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Subscription } from 'rxjs';
// import {
//   ResponseModel,
//   DefaultResponseModel,
// } from 'src/app/models/intent-response.model';
import { ResponsesService } from 'src/app/services/responses.service';
import { MxLoading } from '@marxa/devkit';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { ResponseItemComponent } from './response-item/response-item.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { iResponseResult, ResponseModel } from 'src/app/models/response.model';

@Component({
  selector: 'as-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.scss'],
})
export class ResponsesComponent implements OnInit, OnDestroy {
  /** Respuestas obtenidas de la función de obtener respuestas */
  respuestasList: ResponseModel[] = [];
  /** Modelo de inicio para crear una nueva respuesta simple */
  newOutputMensaje: iResponseResult;
  /** Suscripción a los cambios de la lista de respuestas */
  respuestasChangesSubs!: Subscription;
  /** Lista de componentes de respuestas */
  @ViewChildren( ResponseItemComponent ) cards!: QueryList<ResponseItemComponent>;
  @ViewChild('blankResponse') blankResponse?: ResponseItemComponent;

  openedCard?: number;

  emptyResponse?: ResponseModel;

  @Output() lastPositionChange = new EventEmitter<number>();

  constructor(
    public responses_: ResponsesService,
    private _loading: MxLoading,
    public currentIntent: CurrentIntentService
  ) {
    this.newOutputMensaje = { response: '', suggestions: [] };
    // this._respuestas.getDataForRespuestas();
  }

  ngOnInit(): void {
    this.respuestasChangesSubs = this.responses_.onResponsesChanged.subscribe(
      () => {
        this.newOutputMensaje = { response: '', suggestions: [] };
      }
    );
  }

  /**
   * Crea una nueva respuesta en el arreglo de respuestas para iniciar
   * con la creación de la misma y la abre por defecto
   */
  async addRespuesta() {
    let lastIndex = (await this.responses_.getList()).length;

    this.responses_.emptyResponse =
      new ResponseModel(this.newOutputMensaje, lastIndex),

      await this._loading.waitFor( 500 );
    if ( this.blankResponse ) {
      this.blankResponse.switchEditResp = true;
      let lastPosition = this.blankResponse.ownElement?.nativeElement.offsetTop;
      this.lastPositionChange.emit(lastPosition);
    }
    // window.scrollTo(lastPosition)
  }

  public deleteRespuesta(responseId: string) {
    if (responseId) {
      this.responses_.delRespuesta(responseId);
    }
  }

  cancelAddResponse() {
    delete this.responses_.emptyResponse
  }

  onOpened(index: number) {
    this.openedCard = index;
  }

  async drop(event: CdkDragDrop<ResponseModel[]>) {
    let respuestas = await this.responses_.getList()
    moveItemInArray(respuestas, event.previousIndex, event.currentIndex);
    this.responses_.updateRespuestasOrder(respuestas);
  }

  /** Se desuscribe de los cambios en la lista de respuestas */
  ngOnDestroy() {
    this.respuestasChangesSubs.unsubscribe();
  }
}
