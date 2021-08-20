import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultResponseFormComponent } from './default-response-form.component';

describe('DefaultResponseFormComponent', () => {
  let component: DefaultResponseFormComponent;
  let fixture: ComponentFixture<DefaultResponseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultResponseFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultResponseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
