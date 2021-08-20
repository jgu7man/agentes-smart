// import { RespuestaCard, RespuestaCardButton } from '../agentes/agente/mensajes/mensaje/entrenamiento/respuestas/respuesta.model';

import { ColeccionModel } from "./collection.interface";
import { CardButton, RespuestaCard } from "./dialogflow-responses.model";

export class TarjetaModel {
    constructor (
        public name: string,
        public contenido?: RespuestaCard | string | ColeccionModel,
        public botones?: CardButton[],
        public id?: string
    ) {

    }
}

export interface tipoContenido {
    value: string;
    viewValue: string;
}

export interface tipoElemento {
    value: string;
    viewValue: string;
}
