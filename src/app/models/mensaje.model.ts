import { ContextoModel } from './contexto.model';
import { RespuestaMensaje } from './dialogflow-responses.model';

export class IntentModel {
  name: string
  displayName: string
  public index?: number
  public contexto: string
  public indexContexto: number
  unsaved: boolean

  constructor (
    public intent: iDialogflowIntent,
    index?: number,
    contexto?: string,
    indexContexto?: number,
  ) {
    this.name = intent.name?.slice(
      intent.name.lastIndexOf('/') + 1
    ) || ''
    this.displayName = intent.displayName
    if (index || index === 0) this.index = index
    this.contexto = contexto || ''
    this.indexContexto = indexContexto || 0
    this.unsaved = false
  }
}
export interface iIntent extends IntentModel {}

export class DialogflowIntentModel {
  public rootContext?: string
  public inputContextNames: string[] = []
  private contextPath: string

  constructor (
    private projectId: string,
    public displayName: string,
    rootContext?: string,
  ) {
    this.contextPath = `projects/${ this.projectId }/agent/sessions/-/contexts/`

    var nameContext = normalize(displayName).toLowerCase();
        nameContext = nameContext.replace( /\s/g, '' );
    this.inputContextNames.push( this.contextPath + nameContext )

    if (rootContext) {
      rootContext = normalize(rootContext).toLowerCase();
      this.inputContextNames.push(this.contextPath + rootContext)
    }
  }
}



export interface iDialogflowIntent {
  name: string,
  displayName: string,
  webhookState?: 'WEBHOOK_STATE_ENABLED_FOR_SLOT_FILLING',
  priority?: number,
  isFallback?: boolean,
  mlDisabled?: boolean,
  liveAgentHandoff?: boolean,
  endInteraction?:boolean,
  inputContextNames?: string[],
  events?: string[],
  trainingPhrases?: iTrainingPhrase[],
  action?: string,
  outputContexts?: ContextoModel[],
  resetContexts?: boolean,
  parameters?: iParameter[],
  messages?: RespuestaMensaje[],
  defaultResponsePlatforms?: string[],
  rootFollowupIntentName?: string,
  parentFollowupIntentName?: string,
  followupIntentInfo?: iFollowupIntentInfo[]

}


export interface iTrainingPhrase {
  type: 'EXAMPLE',
  name?: string,
  timesAddedCount?: number,
  parts: iPhrasePart[],
}
  export interface iPhrasePart {
    text: string,
    entityType?: string,
    alias?: string | boolean,
    userDefined?: boolean,
    // selected?: boolean,
    // paramName?: string
  }

export interface iParameter {
  name?: string,
  displayName: string,
  mandatory?: boolean,
  value?: string,
  defaultValue?: string,
  isList?: boolean
  entityTypeDisplayName?: string,
  prompts?: string[],
}

export interface iFollowupIntentInfo {
  followupIntentName: string,
  parentFollowupIntentName: string
}

function normalize(text: string) {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
    to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
    mapping: any = {};

  for (var i = 0, j = from.length; i < j; i++) mapping[from.charAt(i)] = to.charAt(i);

  var ret = [];
  for (var i = 0, j = text.length; i < j; i++) {
    var c = text.charAt(i);
    if (mapping.hasOwnProperty(text.charAt(i))) ret.push(mapping[c]);
    else ret.push(c);
  }
  return ret.join("");
}
