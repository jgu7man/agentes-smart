export class TipoEntidadModel {
    constructor (
        public displayName: string,
        public kind: 'KIND_MAP' | 'KIND_LIST' | 'KIND_REGEXP',
        public autoExpansionMode: 'AUTO_EXPANSION_MODE_UNSPECIFIED' | 'AUTO_EXPANSION_MODE_DEFAULT',
        public entities: iEntity[],
        public enableFuzzyExtraction: boolean,
        public name?: string,

  ) { }

  /** Retorna el displayName sin @ */
  toPlainText() {
    return this.displayName.startsWith('@')
      ? this.displayName.substring(1) : this.displayName
  }

  set value(value) {
    this.displayName = value.displayName
    this.kind = value.kind
    this.autoExpansionMode = value.autoExpansionMode
    this.entities = value.entities
    this.enableFuzzyExtraction = value.enableFuzzyExtraction
    this.name = value.name
  }

  /** Retorna sólo los valores del entityType */
  get value(): iEntityType {
    return {
      displayName: this.displayName,
      kind: this.kind,
      autoExpansionMode: this.autoExpansionMode,
      entities: this.entities,
      enableFuzzyExtraction: this.enableFuzzyExtraction,
      name: this.name
    }
  }


}

export interface iEntityType {
  displayName: string,
  kind: 'KIND_MAP' | 'KIND_LIST' | 'KIND_REGEXP',
  autoExpansionMode: 'AUTO_EXPANSION_MODE_UNSPECIFIED' | 'AUTO_EXPANSION_MODE_DEFAULT',
  entities: iEntity[],
  enableFuzzyExtraction: boolean,
  name?: string,
}

export interface SystemEntitieModel {
    displayName: string,
    ejemplos?:SystemEntitieExample[]
    } export interface SystemEntitieExample {
        request?: string,
        result?:string[]
}


export interface iEntity {
    value: string,
    synonyms?: string[],
}
