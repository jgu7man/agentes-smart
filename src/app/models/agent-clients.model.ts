import firebase from 'firebase/app'

export class ClienteModel {
  constructor(
    public clientId?: string,
    public messengerId?: string,
    public whatsappId?: string,
    public name?: string,
    public photoURL?: string,
    public email?: string,
    public phone?: string,
  ) {
  }
}

export interface iClient extends ClienteModel {
  data?: any,
  lastUpdate: firebase.firestore.Timestamp,
  session?: any,
  isNew?: boolean,
  wasFalback?: boolean,
}

