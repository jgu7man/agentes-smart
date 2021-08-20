import { Directive, Input } from '@angular/core';
import { RespuestaCard } from './dialogflow-responses.model';

/**
 * Modelo de respuestas guardadas en FIRESTORE para cada intent
 * Creates an instance of RespuestaModel.
 * @param {iResponseType} tipo REQUERIDO. El tipo de respuesta que espera
 * @param {ResultResponse} result REQUERIDO. El mensaje que se muestra en la salida o en la interfaz de chat de cada plataforma
 * @param {number} index REQUERIDO. El orden de aparición y de importancia
 * @param {string} [nextIntent] El siguiente intent al que se pretende continuar con la conversación
 * @param {string} [inputContext] El contexto en el cuál se encuentra el inetnt al que pertenece esta respuesta.
 * @param {string} [outputContext] El contexto al que se brincará una vez que la conversación continue
 * @param {string} [accion] Alguna acción en particual alterna que se realizará en el momento de hacer uso de esta respuesta.
 * @param {string} [id] El identificador establecido aleatoriamente por FIRESTORE. Si se declara quedará este como identificador.
 */
export class RespuestaModel {
  constructor(
    public result: ResultResponse,
    public index: number,
    public nextIntent?: string,
    public tipo?: TipoRespuesta,
    public outputContexts?: string[],
    public inputContexts?: string[],
    public accion?: string,
    public id?: string
  ) {}
}

export interface iResponseType {
  display: string;
  name?: 'simple' | 'condicional' | 'grupo_datos' | 'buscar' | 'sugerencias';
  color: string;
  icono: string;
}


/**
 * Modelo de una respuesta simple. Este modelo es usado sólo para crear una respuesta estática y simple ante la request a DIALOGFLOW. Si existe este tipo de respuesta, siempre se debe retornar.
 * @param {EstiloRespuesta} estiloRespuesta El estilo de la respuesta de la cuál se espera
 * @param {RespuestaDisplay} respuesta La respuesta que se espera
 */
export class SimpleModel {
  constructor(
    public text: string,
    public suggestions?: Sugerencia[],
    public asDefault?: boolean
  ) {}
}

class DefaultCtx<T> {
  $implicit!: T;
  asDefault!: T;
  constructor(value: T) {
    this.$implicit = value;
    this.asDefault = value;
  }
}

@Directive({ selector: '[asDefault]'})
export class DefaultContextDirective<T> {

  @Input( 'asDefault' ) set response( response: T ) { }
  static ngTemplateContextGuard<T>(
    dir: DefaultContextDirective<T>,
    ctx: unknown
  ): ctx is DefaultCtx<SimpleModel> {
    return true
  };
}

/**
 * Modelo de una respuesta condicional. Este modelo es para  previamente comparar los parámetros encontrados en la request a DIALOGDFLOW a través del nombre de parámetro esperado con los datos de una entityType. TODOS LOS PARÁMETROS SON REQUERIDOS
 * @param {EstiloRespuesta} estiloRespuesta El estilo de la respuesta de la cuál se espera
 * @param {RespuestaDisplay} respuesta La respuesta que se espera mostrar
 * @param {string} parametro El parámetro que se buscará en la request del cliente
 * @param {string} condicion La condición que comparará el valor
 * @param {(string | number | any[])} valor Los valores con los que se comparará el parámetro
 */
export class CondicionalModel extends SimpleModel {
  constructor(
    public parametro: string,
    public condicion: string,
    public valor: string | number | any[]
  ) // public text: string,
  {
    super('', []);
  }
}

export interface iCondition {
  displayText: string;
  operator: string;
}

class ConditionalCtx<T> {
  $implicit!: T;
  asConditional!: T;
  constructor(value: T) {
    this.$implicit = value;
    this.asConditional = value;
  }
}

@Directive({ selector: '[asConditional]'})
export class ConditionalContextDirective<T> {

  @Input( 'asConditional' ) set response( response: T ) { }
  static ngTemplateContextGuard<T>(
    dir: ConditionalContextDirective<T>,
    ctx: unknown
  ): ctx is ConditionalCtx<CondicionalModel> {
    return true
  };
}

/**
 * Modelo de una respuesta de registro de datos. Esta respuesta respeta el modelo creado en una colección de datos y va generando un objeto con los datos obtenidos. TODOS LOS PARÁMETROS SON REQUERIDOS
 * @param {EstiloRespuesta} estiloRespuesta El estilo de la respuesta de la cuál se espera
 * @param {RespuestaDisplay} respuesta  La respuesta que se espera mostrar
 * @param {string} parametro El parámetro al cuál se le pondrá atención del array de parámetros que haya regresado la request a Dialogflow
 * @param {string} grupoDatos El grupo de datos al cuál se agregará el parámetro encontrado.
 * @param {string} key La variable del grupo de datos a la cuál se asignará el valor del parámetro encontrado.
 */
export class RegistroDatosModel extends SimpleModel {
  constructor(
    public parametro: string,
    public coleccion: string,
    public key: string
  ) // public text: string,
  // public suggestions?: Suggest[],
  {
    super('', []);
  }
}

class CatchCtx<T> {
  $implicit!: T;
  asCatch!: T;
  constructor(value: T) {
    this.$implicit = value;
    this.asCatch = value;
  }
}

@Directive({ selector: '[asCatch]'})
export class CatchContextDirective<T> {

  @Input( 'asCatch' ) set response( response: T ) { }
  static ngTemplateContextGuard<T>(
    dir: CatchContextDirective<T>,
    ctx: unknown
  ): ctx is CatchCtx<RegistroDatosModel> {
    return true
  };
}

/**
 *Modelo de una respuesta de búsqueda. Este modelo buscará el parámetro esperado que el cliente haya asignado en la collection de FIRESTORE asignada en el párametro y siempre retornará una respuesta de estilo `card`.
 * @param {string} parametro El parámetro al cuál se le pondrá atención del array de parámetros que haya regresado la request a Dialogflow
 * @param {string} database La collection de FIRESTORE en la cuál buscará el valor del parámetro encontrado.
 * @param {RespuestaCard} [respuesta] La respuesta que será mostrada en la interfaz
 * @param {'card'} [estiloRespuesta] El estidlo de respuesta que siempre es 'card'.
 */
export class RespuestaBuscarModel extends SimpleModel {
  constructor(
    public parametro: string,
    public database: string,
    public card?: RespuestaCard
  ) // public text?: string ,
  {
    super('', []);
  }
}

class SearchCtx<T> {
  $implicit!: T;
  asSearch!: T;
  constructor(value: T) {
    this.$implicit = value;
    this.asSearch = value;
  }
}

@Directive({ selector: '[asSearch]'})
export class SearchContextDirective<T> {

  @Input( 'asSearch' ) set response( response: T ) { }
  static ngTemplateContextGuard<T>(
    dir: SearchContextDirective<T>,
    ctx: unknown
  ): ctx is SearchCtx<RespuestaBuscarModel> {
    return true
  };
}

export class SugerenciasModel {
  constructor(public text: string, public sugerencias: Sugerencia[]) {}
}

/**
 * Modelo de repsuesta binaria. Este modelo permite responder sólo una de dos formas ante una respuesta positiva o negativa del cliente. IMPORTANTE: Aún no es utilizada en el fronend. Ambos parámetros son requeridos.
 * @param {EstiloRespuesta} respuestaYES Lo que se responderá ante una respuesta positiva del cliente.
 * @param {EstiloRespuesta} respuestaNO Lo que se responderá ante una respuesta negativa del cliente.
 */
export class RespuestaBinaria {
  constructor(
    public respuestaYES: EstiloRespuesta,
    public respuestaNO: EstiloRespuesta
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

export type TipoRespuesta =
  | 'simple'
  | 'condicional'
  | 'grupo_datos'
  | 'buscar'
  | 'sugerencias';
export type ResultResponse =
  | SimpleModel
  | CondicionalModel
  | RegistroDatosModel
  | RespuestaBuscarModel;
export type EstiloRespuesta = 'texto' | 'sugerencias' | RespuestaBinaria;
export type RespuestaDisplay = string | Sugerencia | RespuestaCard;

