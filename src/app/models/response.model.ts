import { RespuestaCard } from './dialogflow-responses.model';


export class ResponseModel {
  public outputContexts: string[] = []
  public inputContexts: string[] = []
  public asDefault: boolean
  public conditions?: iCondition[]
  constructor(
    public result: iResponseResult,
    public index: number,
    public id?: string,
  ) {
    this.asDefault = false
  }
}

export interface iResponse extends ResponseModel{ }
export interface iResponseResult {
  response: ResponseDisplay,
  suggestions?: string[],
}


export interface iCondition {
  parameter: string,
  condition: string,
  value: string | number | any[]
}









export class SugerenciasModel {
  constructor(public text: string, public sugerencias: Sugerencia[]) {}
}

/**
 * Modelo de repsuesta binaria. Este modelo permite responder sólo una de dos formas ante una respuesta positiva o negativa del cliente. IMPORTANTE: Aún no es utilizada en el fronend. Ambos parámetros son requeridos.
 * @param {ResponseStyle} respuestaYES Lo que se responderá ante una respuesta positiva del cliente.
 * @param {ResponseStyle} respuestaNO Lo que se responderá ante una respuesta negativa del cliente.
 */
export class BinaryResponseModel {
  constructor(
    public respuestaYES: ResponseStyle,
    public respuestaNO: ResponseStyle
  ) {}
}

/**
 * Modelo de un estilo de respuesta que será consumida en el front.
 * @param {Sugerencia} sugerencias REQUERIDO. Arreglo de textos que serán tomadas como sugerencias de respuestas.
 * @param {string} mensaje Texto que será mostrado describiendo las sugerencias
 *
 * @export
 * @interface RespuestaSugerencias
 */
export interface Sugerencia {
  text: string;
  context?: string;
}

export interface SugerenciasResult {
  value: Sugerencia[];
  activated: boolean;
}


export interface TextRespuesta {
  text: string;
  param: string;
}


export type ResponseStyle = 'text' | 'suggests' | BinaryResponseModel;
export type ResponseDisplay = string | Sugerencia | RespuestaCard;
