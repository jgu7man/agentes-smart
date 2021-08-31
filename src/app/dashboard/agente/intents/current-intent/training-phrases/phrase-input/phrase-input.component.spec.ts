import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhraseInputComponent } from './phrase-input.component';

describe('PhraseInputComponent', () => {
  let component: PhraseInputComponent;
  let fixture: ComponentFixture<PhraseInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhraseInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhraseInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
