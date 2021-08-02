import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { MxCache } from '@marxa/devkit';
import { Subscription } from 'rxjs';
import { Interaction } from '../../chat.model';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'as-chat',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss']
})
export class ChatContainerComponent implements OnInit, OnDestroy {

  public conversation: Interaction[] = []

  @Input() clientId: string = ''
  @Input() projectId: string = ''
  @Input() userId: string = 'TEST'

  @Output() closeChatWindow: EventEmitter<void> = new EventEmitter()
  @Output() sendedMessage: EventEmitter<boolean> = new EventEmitter()
  @Output() successMessage: EventEmitter<boolean> = new EventEmitter()

  private _listenSubscription!: Subscription
  private sendedSubscription: Subscription;
  private successSubscription: Subscription;

  constructor (
    public chat: ChatService,
  ) {
    this.sendedSubscription = this.chat.messageSended$.subscribe( sended => {
      this.sendedMessage.emit( sended );
    } )
    this.successSubscription = this.chat.messageSuccess$.subscribe( success => {
      this.successMessage.emit( success );
    })
   }

  ngOnInit(): void {
    this._listenSubscription = this.chat.listenForMessage(
      this.clientId, this.projectId, this.userId
    );
  }

  ngOnDestroy(): void {
    this.sendedSubscription.unsubscribe()
    this.successSubscription.unsubscribe()
    this._listenSubscription.unsubscribe()
  }


}
