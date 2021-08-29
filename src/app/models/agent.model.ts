import firebase from 'firebase/app'

export class AgenteModel {
  public path: string;
  public description: string
  public avatarUri: ImageUri
  public started: boolean
  public created: Date | firebase.firestore.Timestamp
  public projectId: string
  constructor(
    public displayName: string,
    public defaultLanguageCode: string,
    public timeZone: string,
    public owner: string,
    public createdBy: string,
    description?: string,
    avatarUri?: ImageUri,
    started?: boolean,
  ) {
    var sufixId = displayName.split( ' ' ).join( '-' ).toLowerCase();
    this.projectId = `${sufixId}-${randomText(6)}`;
    this.path = `usuarios/${owner}/agentes/${this.projectId}`
    this.description = description || `Agente ${ this.displayName }`;
    this.avatarUri = avatarUri || { url: 'favicon.ico', alt: 'Logo Agente Smart' }
    this.started = started || false;
    this.created = new Date()
  }

}

export interface iAgente extends AgenteModel {}

export interface ImageUri {
    url: string
    alt: string
}

export function randomText(digits?: number) {
  return Math.random()
    .toString(36)
    .substring(digits ? digits : 6);
}

export class AgenteConfigModel {
  constructor (
      public contact_resource: string
  ) {

  }
}
