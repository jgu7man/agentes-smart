import { iContext } from './context.model';
import { RespuestaMensaje } from './dialogflow-responses.model';

export class IntentStateModel {
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
    this.name = extractIntentId(this.intent.name) || ''
    this.displayName = intent.displayName
    if (index || index === 0) this.index = index
    this.contexto = contexto || ''
    this.indexContexto = indexContexto || 0
    this.unsaved = false
  }
}
export interface iIntentState extends IntentStateModel {}

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
  webhookState: 'WEBHOOK_STATE_ENABLED_FOR_SLOT_FILLING',
  priority?: number,
  isFallback?: boolean,
  mlDisabled?: boolean,
  liveAgentHandoff?: boolean,
  endInteraction?:boolean,
  inputContextNames: string[],
  events?: string[],
  trainingPhrases: iTrainingPhrase[],
  action?: string,
  outputContexts: iContext[],
  resetContexts?: boolean,
  parameters: iParameter[],
  messages: RespuestaMensaje[],
  defaultResponsePlatforms?: string[],
  rootFollowupIntentName?: string,
  parentFollowupIntentName?: string,
  followupIntentInfo?: iFollowupIntentInfo[]
}

export const emptyIntent: iDialogflowIntent = {
  name: '',
  displayName: '',
  webhookState: 'WEBHOOK_STATE_ENABLED_FOR_SLOT_FILLING',
  inputContextNames: [],
  trainingPhrases: [],
  outputContexts: [],
  parameters: [],
  messages: [],
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
}

export const emptyTraningPhrase: iTrainingPhrase = {
  type: 'EXAMPLE',
  parts: [],
}


export class ParameterModel {
  mandatory: boolean
  isList: boolean
  defaultValue?: string
  prompts?: string[]
  constructor(
    public displayName: string,
    public value: string,
    public entityTypeDisplayName: string,
    defaultValue?: string,
    prompts?: string[]
  ) {
    this.mandatory = true
    this.isList = true

    if ( defaultValue ) this.defaultValue = defaultValue
    else delete this.defaultValue

    if ( prompts ) this.prompts = prompts
    else delete this.prompts

  }
}

export interface iParameter {
  name?: string,
  displayName: string,
  value: string,
  entityTypeDisplayName: string,
  mandatory?: boolean,
  defaultValue?: string,
  isList?: boolean
  prompts?: string[],
}

export interface iParamSelected {
  value: string;
  isOriginal?: boolean;
}


export interface iFollowupIntentInfo {
  followupIntentName: string,
  parentFollowupIntentName: string
}

export function extractIntentId( intentName: string ): string {
  return intentName.slice( intentName.lastIndexOf('/') + 1 )
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
