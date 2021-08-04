import firebase from 'firebase/app'

export class AgenteModel {

  public description: string
  public avatarUri: ImageUri
  public started: boolean
  public created: Date | firebase.firestore.Timestamp
  constructor(
    public projectId: string,
    public displayName: string,
    public defaultLanguageCode: string,
    public timeZone: string,
    public owner: string,
    description?: string,
    avatarUri?: ImageUri,
    started?: boolean,
  ) {
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
