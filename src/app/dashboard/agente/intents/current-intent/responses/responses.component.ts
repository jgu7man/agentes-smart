import { CardResponseComponent } from './card-response/card-response.component';
import { Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import { RespuestaModel, SimpleModel } from 'src/app/models/intent-response.model';
import { RespuestasService } from 'src/app/services/respuestas.service';
import { MxLoading } from '@marxa/devkit';
import { CurrentIntentService } from 'src/app/services/current-intent.service';
import { ResponseItemComponent } from './response-item/response-item.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'as-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.scss']
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

  @Output() lastPositionChange = new EventEmitter<number>();

    constructor(
        private _respuestas: RespuestasService,
        private _loading: MxLoading,
        public mensaje_: CurrentIntentService
    ) {
        this.newOutputMensaje = new SimpleModel('', []);
      // this._respuestas.getDataForRespuestas();
    }

  ngOnInit(): void {
        this.respuestasChangesSubs = this._respuestas.onRespuestasChanged.subscribe(
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
        let lastIndex = this.mensaje_.respuestasList$.getValue().length;
      this.mensaje_.respuestasList$.next([
        ...this.mensaje_.respuestasList$.getValue(),
        new RespuestaModel( this.newOutputMensaje, lastIndex, '*fin', undefined)
        ]
      );
        await this._loading.waitFor(500);
      this.cards.last.switchEditResp = true;
      let lastPosition = this.cards.last.ownElement.nativeElement.offsetTop
      this.lastPositionChange.emit(lastPosition);
      // window.scrollTo(lastPosition)
    }


    trackResponseById(index: number, respuesta: RespuestaModel) {
        return respuesta.index;
    }

    public deleteRespuesta(respuestaId: string, index: number) {
      console.log(this.mensaje_.respuestasList$);
      const respuestas = this.mensaje_.respuestasList$.getValue()
        let resToDel = respuestas.findIndex(
            (res) => res.id === respuestaId);

        if (resToDel >= 0) {
            this._respuestas.delRespuesta(respuestaId)
        }
        respuestas.splice(resToDel, 1)
      this.mensaje_.respuestasList$.next(respuestas)

    }

  onOpened(index: number) {
    this.openedCard = index
  }


  drop(event: CdkDragDrop<RespuestaModel[]>) {
      let respuestas = this.mensaje_.respuestasList$.getValue()
      moveItemInArray(respuestas, event.previousIndex, event.currentIndex);
      this._respuestas.updateRespuestasOrder(respuestas)

    }

    /** Se desuscribe de los cambios en la lista de respuestas */
    ngOnDestroy() {
        this.respuestasChangesSubs.unsubscribe();
    }

}
