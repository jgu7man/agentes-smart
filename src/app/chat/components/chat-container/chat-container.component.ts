import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
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
  // private storeSubs: Subscription
  @Output() closeChatWindow: EventEmitter<any> = new EventEmitter()
  @Output() sendMessage: EventEmitter<any> = new EventEmitter()
  @Output() reciveMessage: EventEmitter<any> = new EventEmitter()


  constructor (
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
  }

  ngOnDestroy(){
    // this.storeSubs.unsubscribe()
    // this.store.dispatch(actions.clean())
  }

}
