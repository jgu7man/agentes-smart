import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartTipoComponent } from './start-tipo.component';

describe('StartTipoComponent', () => {
  let component: StartTipoComponent;
  let fixture: ComponentFixture<StartTipoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartTipoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
