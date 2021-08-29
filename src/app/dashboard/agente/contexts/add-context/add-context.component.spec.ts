import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContextComponent } from './add-context.component';

describe('AddContextComponent', () => {
  let component: AddContextComponent;
  let fixture: ComponentFixture<AddContextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddContextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
