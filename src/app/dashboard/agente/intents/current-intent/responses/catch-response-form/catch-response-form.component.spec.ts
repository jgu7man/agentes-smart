import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatchResponseFormComponent } from './catch-response-form.component';

describe('CatchResponseFormComponent', () => {
  let component: CatchResponseFormComponent;
  let fixture: ComponentFixture<CatchResponseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatchResponseFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatchResponseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
