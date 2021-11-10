import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesResumenComponent } from './clientes-resumen.component';

describe('ClientesResumenComponent', () => {
  let component: ClientesResumenComponent;
  let fixture: ComponentFixture<ClientesResumenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientesResumenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesResumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
