import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartParameterComponent } from './part-parameter.component';

describe('PartParameterComponent', () => {
  let component: PartParameterComponent;
  let fixture: ComponentFixture<PartParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartParameterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
