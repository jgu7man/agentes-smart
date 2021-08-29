export class MessengerStatus {
  constructor (
    public page_access_token: string,
    public activo: boolean,
  ) { }
}

export interface WhatsappStatus {
  status:'DISCONNECTED' | 'CONNECTED'
  qr?: string,
  session?: any
  disconnected?: any
}
