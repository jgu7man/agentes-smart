import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartEntityTypesComponent } from './start-entity-types.component';

describe('StartEntityTypesComponent', () => {
  let component: StartEntityTypesComponent;
  let fixture: ComponentFixture<StartEntityTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartEntityTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartEntityTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
