import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentIntentComponent } from './current-intent.component';

describe('CurrentIntentComponent', () => {
  let component: CurrentIntentComponent;
  let fixture: ComponentFixture<CurrentIntentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentIntentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentIntentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
