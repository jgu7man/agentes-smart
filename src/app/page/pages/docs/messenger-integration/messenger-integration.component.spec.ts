import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessengerIntegrationComponent } from './messenger-integration.component';

describe('MessengerIntegrationComponent', () => {
  let component: MessengerIntegrationComponent;
  let fixture: ComponentFixture<MessengerIntegrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessengerIntegrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessengerIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
