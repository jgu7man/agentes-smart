import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetAgenteComponent } from './set-agente.component';

describe('SetAgenteComponent', () => {
  let component: SetAgenteComponent;
  let fixture: ComponentFixture<SetAgenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetAgenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetAgenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
