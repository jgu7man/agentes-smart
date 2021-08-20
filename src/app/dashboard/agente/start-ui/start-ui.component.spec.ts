import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartUiComponent } from './start-ui.component';

describe('StartUiComponent', () => {
  let component: StartUiComponent;
  let fixture: ComponentFixture<StartUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
