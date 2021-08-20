import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardResponseComponent } from './card-response.component';

describe('CardResponseComponent', () => {
  let component: CardResponseComponent;
  let fixture: ComponentFixture<CardResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardResponseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
