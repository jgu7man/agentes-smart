import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteClientDialog } from './delete-client.dialog';

describe('DeleteClientDialog', () => {
  let component: DeleteClientDialog;
  let fixture: ComponentFixture<DeleteClientDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteClientDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteClientDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
