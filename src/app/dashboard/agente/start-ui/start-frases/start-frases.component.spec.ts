import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartFrasesComponent } from './start-frases.component';

describe('StartFrasesComponent', () => {
  let component: StartFrasesComponent;
  let fixture: ComponentFixture<StartFrasesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartFrasesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartFrasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
