import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestResponseComponent } from './suggest-response.component';

describe('SuggestResponseComponent', () => {
  let component: SuggestResponseComponent;
  let fixture: ComponentFixture<SuggestResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuggestResponseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
