import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'as-remitter-area',
  templateUrl: './remitter-area.component.html',
  styleUrls: ['./remitter-area.component.scss']
})
export class RemitterAreaComponent implements OnInit {

  @Output() closeChatWindow: EventEmitter<void> = new EventEmitter()
  constructor (
    public chat_: ChatService
  ) { }

  ngOnInit(): void {
  }

}
