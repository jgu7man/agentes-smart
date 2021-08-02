import { CardButton } from "../models/dialogflow-responses.model"

export class ChatSessionModel {
  constructor(
    public projectId: string,
    public clientId: string,
    public userIDs: iUserIDs,
    public textInput: string,
    public sessionId?: string,
    public inputContexts?: any
  ){}
}

export interface iUserIDs {
  userId?: string,
  messengerId?: string,
  whatsappId?:string
}

export interface iSessionResponse {
  session: string,
  contextos: any[]
  respuestas: any[]
}

export class Interaction {

    public message: string | QuickResponse[] | Image | CardButton[]
    public emiter: 'this' | 'that'
    public time: Date

    constructor (
        message: string | QuickResponse[] | Image | CardButton[],
        emiter: 'this' | 'that'
    ) {
        this.message = message
        this.emiter = emiter
        this.time = new Date()
    }

}

export class ConversationItem {
    constructor (
        public message: string | QuickResponse[] | Image ,
        public emiter?: 'this' | 'that',
        public time?: Date,
    ){}
}

export type MessageType = string | QuickResponse | Image


export interface QuickResponse {
    displayText: string,
    value: string
}

export interface Image {
    src: string,
    alt: string
}
