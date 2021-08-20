import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhraseItemComponent } from './phrase-item.component';

describe('PhraseItemComponent', () => {
  let component: PhraseItemComponent;
  let fixture: ComponentFixture<PhraseItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhraseItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhraseItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
