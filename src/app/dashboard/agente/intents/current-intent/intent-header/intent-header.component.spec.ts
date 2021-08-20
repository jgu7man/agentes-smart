import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntentHeaderComponent } from './intent-header.component';

describe('IntentHeaderComponent', () => {
  let component: IntentHeaderComponent;
  let fixture: ComponentFixture<IntentHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntentHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntentHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
