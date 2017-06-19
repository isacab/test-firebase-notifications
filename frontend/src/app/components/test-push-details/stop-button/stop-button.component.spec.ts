import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StopButtonComponent } from './stop-button.component';

describe('StopButtonComponent', () => {
  let component: StopButtonComponent;
  let fixture: ComponentFixture<StopButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StopButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StopButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
