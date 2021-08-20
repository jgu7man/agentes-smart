import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseItemComponent } from './response-item.component';

describe('ResponseItemComponent', () => {
  let component: ResponseItemComponent;
  let fixture: ComponentFixture<ResponseItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResponseItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
