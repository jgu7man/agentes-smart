import { EventEmitter, OnDestroy, Output } from '@angular/core';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
} from '@angular/core';
import { MxLoading, MxText } from '@marxa/devkit';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CardButton, Suggest } from 'src/app/models/dialogflow-responses.model';
import { Image, Interaction, QuickResponse } from '../../chat.model';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'as-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
})
export class ConversationComponent implements OnInit, AfterViewInit, OnDestroy {
  messages: Interaction[] = [];
  @ViewChild( 'messagesContainer' ) public messagesContainer!: ElementRef;


  constructor(
    private _text: MxText,
    public chat: ChatService,
  ) {

  }

  ngOnInit(): void {}

  ngAfterViewInit() {

  }

  messageType(msg: string | QuickResponse[] | Image | CardButton[]) {
    if (typeof msg == 'string') {
      return 'string';
    } else {
      if ('src' in msg) {
        return 'image';
      } else {
        return 'quickresponse';
      }
    }
  }

  toQuickResponses( msg: any ): QuickResponse[] {
    return Array.isArray(msg) ? msg  : []
  }

  onSuggest(item: QuickResponse) {
    this.chat.sendMessage$.next(item.displayText);
  }

  formatDate(fecha: Date) {
    const hoy = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );

    if (fecha > hoy) {
      return this._text.stringifyTime(fecha);
    } else {
      return `${this._text.stringifyShortDate(
        fecha
      )} - ${this._text.stringifyTime(fecha)}`;
    }
  }

  ngOnDestroy() {
  }
}
