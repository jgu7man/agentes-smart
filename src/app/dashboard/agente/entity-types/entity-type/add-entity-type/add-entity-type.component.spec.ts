import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEntityTypeComponent } from './add-entity-type.component';

describe('AddEntityTypeComponent', () => {
  let component: AddEntityTypeComponent;
  let fixture: ComponentFixture<AddEntityTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEntityTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEntityTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
