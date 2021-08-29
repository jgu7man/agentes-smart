import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultIntentsComponent } from './default-intents.component';

describe('DefaultIntentsComponent', () => {
  let component: DefaultIntentsComponent;
  let fixture: ComponentFixture<DefaultIntentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultIntentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultIntentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
