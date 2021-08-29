import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextItemComponent } from './context-item.component';

describe('ContextItemComponent', () => {
  let component: ContextItemComponent;
  let fixture: ComponentFixture<ContextItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContextItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
