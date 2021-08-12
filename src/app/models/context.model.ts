export interface iContext {
    contextName: string
    lifespanCount?: number
    index?: number
    parameters?: Object
    id?: string,
    color?: string
}

export interface iContextList {
  [name: string]: any[]
}
