import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntentBreadcumsComponent } from './intent-breadcums.component';

describe('IntentBreadcumsComponent', () => {
  let component: IntentBreadcumsComponent;
  let fixture: ComponentFixture<IntentBreadcumsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntentBreadcumsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntentBreadcumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
