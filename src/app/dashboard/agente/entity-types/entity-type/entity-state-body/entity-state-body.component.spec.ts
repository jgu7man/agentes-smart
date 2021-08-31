import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityStateBodyComponent } from './entity-state-body.component';

describe('EntityStateBodyComponent', () => {
  let component: EntityStateBodyComponent;
  let fixture: ComponentFixture<EntityStateBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityStateBodyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityStateBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
