import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionalResponseFormComponent } from './conditional-response-form.component';

describe('ConditionalResponseFormComponent', () => {
  let component: ConditionalResponseFormComponent;
  let fixture: ComponentFixture<ConditionalResponseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConditionalResponseFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConditionalResponseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
