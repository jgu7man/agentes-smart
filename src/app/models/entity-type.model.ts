export class EntityTypeModel {
  public kind: EntityKind;
  public autoExpansionMode:
    | 'AUTO_EXPANSION_MODE_UNSPECIFIED'
    | 'AUTO_EXPANSION_MODE_DEFAULT';
  public entities: iEntity[];
  public enableFuzzyExtraction: boolean;

  constructor(
    public displayName: string,
    entities?: iEntity[],
    kind?: EntityKind
  ) {
    this.kind = kind || 'KIND_MAP';
    this.autoExpansionMode = 'AUTO_EXPANSION_MODE_DEFAULT';
    this.entities = entities || [];
    this.enableFuzzyExtraction = true;
  }
}

export interface iEntityType extends EntityTypeModel {
  name: string;
}

export interface iSystemEntity {
  displayName: string;
  examples?: SystemEntitieExample[];
}
export interface SystemEntitieExample {
  request?: string;
  result?: string[];
}

export interface iEntity {
  value: string;
  synonyms?: string[];
}

export function extractTypeId(typeName: string): string {
  return typeName.slice(typeName.lastIndexOf('/') + 1);
}

export class EntityTypeStateModel {
  public saved: boolean;
  public selected: boolean;
  public body: iEntityType;
  public name: string;
  constructor(body: iEntityType) {
    this.saved = true;
    this.body = body;
    this.name = body.name || '';
    this.selected = false;
  }
}

export interface iEntityTypeState extends EntityTypeStateModel {}
export type EntityKind = 'KIND_MAP' | 'KIND_LIST' | 'KIND_REGEXP'
