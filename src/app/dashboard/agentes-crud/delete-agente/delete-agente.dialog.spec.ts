import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAgenteDialog } from './delete-agente.dialog';

describe('DeleteAgenteDialog', () => {
  let component: DeleteAgenteDialog;
  let fixture: ComponentFixture<DeleteAgenteDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteAgenteDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteAgenteDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
