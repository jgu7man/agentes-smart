import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MxCache, MxLoading } from '@marxa/devkit';
import { pluck } from 'rxjs/operators';
import { Interaction } from '../../chat.model';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'as-typing-area',
  templateUrl: './typing-area.component.html',
  styleUrls: ['./typing-area.component.scss'],
})
export class TypingAreaComponent implements OnInit {
  message: string = '';
  @ViewChild('messageInput') private messageInput!: ElementRef;

  constructor(
    private _chat: ChatService,
    private _cache: MxCache,
    private _loading: MxLoading,
    // private _agente: CurrentAgenteService
  ) {

  }

  ngOnInit(): void {}

  onSend() {
    // this._chat.conversation.push( new Interaction(this.message, 'this'))
    console.log(this.message);
    this._chat.sendMessage$.next(this.message);
    this.message = '';
  }

  cleanConversation() {
    this._chat.conversation = []
    this._cache.deleteDataKey( 'currentSession' )
    this._cache.deleteDataKey( 'inputContexts')
    this._chat.clearSession()
  }
}
