import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResponseFormComponent } from './search-response-form.component';

describe('SearchResponseFormComponent', () => {
  let component: SearchResponseFormComponent;
  let fixture: ComponentFixture<SearchResponseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchResponseFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResponseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
