import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewButtonComponent } from './new-button.component';

describe('NewButtonComponent', () => {
  let component: NewButtonComponent;
  let fixture: ComponentFixture<NewButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
