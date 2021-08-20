import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingPhrasesComponent } from './training-phrases.component';

describe('TrainingPhrasesComponent', () => {
  let component: TrainingPhrasesComponent;
  let fixture: ComponentFixture<TrainingPhrasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingPhrasesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingPhrasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
