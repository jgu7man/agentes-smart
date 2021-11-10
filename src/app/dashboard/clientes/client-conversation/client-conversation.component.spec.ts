import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientConversationComponent } from './client-conversation.component';

describe('ClientConversationComponent', () => {
  let component: ClientConversationComponent;
  let fixture: ComponentFixture<ClientConversationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientConversationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
