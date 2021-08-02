import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ChatContainerComponent } from './components/chat-container/chat-container.component';
import { ConversationComponent } from './components/conversation/conversation.component';
import { RemitterAreaComponent } from './components/remitter-area/remitter-area.component';
import { TypingAreaComponent } from './components/typing-area/typing-area.component';



@NgModule({
  declarations: [
    ChatContainerComponent,
    ConversationComponent,
    RemitterAreaComponent,
    TypingAreaComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ChatContainerComponent,
  ]
})
export class ChatModule { }
