import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteIntentDialog } from './delete-intent.dialog';

describe('DeleteIntentDialog', () => {
  let component: DeleteIntentDialog;
  let fixture: ComponentFixture<DeleteIntentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteIntentDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteIntentDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
