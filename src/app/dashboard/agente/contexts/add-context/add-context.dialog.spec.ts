import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContextDialog } from './add-context.dialog';

describe('AddContextDialog', () => {
  let component: AddContextDialog;
  let fixture: ComponentFixture<AddContextDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddContextDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContextDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
