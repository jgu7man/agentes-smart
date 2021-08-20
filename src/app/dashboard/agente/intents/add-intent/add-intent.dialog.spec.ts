import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIntentDialog } from './add-intent.dialog';

describe('AddIntentDialog', () => {
  let component: AddIntentDialog;
  let fixture: ComponentFixture<AddIntentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddIntentDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddIntentDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
