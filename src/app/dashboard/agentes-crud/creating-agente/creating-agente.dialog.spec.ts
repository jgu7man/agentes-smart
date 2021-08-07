import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatingAgenteDialog } from './creating-agente.dialog';

describe('CreatingAgenteDialog', () => {
  let component: CreatingAgenteDialog;
  let fixture: ComponentFixture<CreatingAgenteDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatingAgenteDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatingAgenteDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
