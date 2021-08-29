export interface iAgentInteraction {
  usuario: string;
  agente: string[];
  intent: IntentInteraction;
  checked: boolean;
  time: Date;
  clientId: string;
  id: string;
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
