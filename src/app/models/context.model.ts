import { iIntentState } from "./intent.model";
import firebase from 'firebase/app'


export class ContextModel {
  public name: string
  public color: string
  public id: string
  public lifespanCount: number
  public index: number
  constructor (
    name: string,
    index?: number,
  ) {
    this.name = normalize( name ).toLowerCase();
    this.index = index || 0
    this.color = generateHSLcolor( 50, 50 )
    this.lifespanCount = 3
    this.id = firebase.firestore().doc('').id
  }
}

export interface iContext {
  name: string
  index: number
  lifespanCount: number
  color: string
  id: string,
}

export interface iContextList {
  [name: string]: iIntentState[]
}

export interface iContextSelected {
  context: string,
  continueIntents: any[]
}

function generateHSLcolor(saturation: number, light: number): string {
  return `hsl(${Math.ceil(360 * Math.random())},${saturation}%,${light}%)`;
}

function normalize(text: string) {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
    to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
    mapping: any = {};

  for (var i = 0, j = from.length; i < j; i++) mapping[from.charAt(i)] = to.charAt(i);

  var ret = [];
  for (var i = 0, j = text.length; i < j; i++) {
    var c = text.charAt(i);
    if (mapping.hasOwnProperty(text.charAt(i))) ret.push(mapping[c]);
    else ret.push(c);
  }
  return ret.join("");
}
