import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallContactComponent } from './call-contact.component';

describe('CallContactComponent', () => {
  let component: CallContactComponent;
  let fixture: ComponentFixture<CallContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallContactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
