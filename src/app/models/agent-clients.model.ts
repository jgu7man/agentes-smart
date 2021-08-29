export class ClienteModel {
  constructor(
    public clientId?: string,
    public messengerId?: string,
    public whatsappId?: string,
    public name?: string,
    public photoURL?: string,
    public email?: string,
    public phone?: string,
  ) {}
}

export interface iClient extends ClienteModel {
  clientId: string,
  messengerId?: string,
  whatsappId?: string,
  name?: string,
  photoURL?: string,
  email?: string,
  phone?: string,
}
