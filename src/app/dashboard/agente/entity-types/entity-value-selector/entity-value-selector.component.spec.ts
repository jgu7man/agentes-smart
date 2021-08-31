import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityValueSelectorComponent } from './entity-value-selector.component';

describe('EntityValueSelectorComponent', () => {
  let component: EntityValueSelectorComponent;
  let fixture: ComponentFixture<EntityValueSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityValueSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityValueSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
