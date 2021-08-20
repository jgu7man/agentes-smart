import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamRowComponent } from './param-row.component';

describe('ParamRowComponent', () => {
  let component: ParamRowComponent;
  let fixture: ComponentFixture<ParamRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParamRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
