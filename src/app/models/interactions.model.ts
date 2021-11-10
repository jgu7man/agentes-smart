import firebase from 'firebase/app'

enum messageKey {
  agent, agente}
type agentMessage = {
  [agent: string]: string[]
}
export interface iAgentInteraction {
  client: string;
  agente: string[];
  agent: string[];
  // [agent: string]: string[]
  intent: IntentInteraction;
  checked: boolean;
  time: Date | firebase.firestore.Timestamp;
  id: string;
  usuario: string;
}

export interface IntentInteraction {
  intentId: string;
  intentName: string;
}

// export class InteractionModel {
//   usuario: string;
//   agente: string[];
//   intent: IntentInteraction;
//   checked: boolean;
//   time: Date;
//   constructor(
//     interaction: any
//   ) {
//     if ( Array.isArray(interaction) && interaction[ 0 ].message ) {
//       let message = interaction[ 0 ].message
//       this.usuario = message.text
//     }
//   }
// }
