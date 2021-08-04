import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentesCrudComponent } from './agentes-crud.component';

describe('AgentesCrudComponent', () => {
  let component: AgentesCrudComponent;
  let fixture: ComponentFixture<AgentesCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentesCrudComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentesCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
