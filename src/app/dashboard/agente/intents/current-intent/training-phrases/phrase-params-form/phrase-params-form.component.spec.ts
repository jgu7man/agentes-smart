import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhraseParamsFormComponent } from './phrase-params-form.component';

describe('PhraseParamsFormComponent', () => {
  let component: PhraseParamsFormComponent;
  let fixture: ComponentFixture<PhraseParamsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhraseParamsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhraseParamsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
