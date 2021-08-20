import { iIntentState } from "./intent.model";

export interface iContext {
    contextName: string
    lifespanCount?: number
    index?: number
    parameters?: Object
    id?: string,
    color?: string
}

export interface iContextList {
  [name: string]: iIntentState[]
}

export interface iContextSelected {
  context: string,
  continueIntents: any[]
}
