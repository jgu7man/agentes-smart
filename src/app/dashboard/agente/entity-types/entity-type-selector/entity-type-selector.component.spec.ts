import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTypeSelectorComponent } from './entity-type-selector.component';

describe('EntityTypeSelectorComponent', () => {
  let component: EntityTypeSelectorComponent;
  let fixture: ComponentFixture<EntityTypeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityTypeSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
