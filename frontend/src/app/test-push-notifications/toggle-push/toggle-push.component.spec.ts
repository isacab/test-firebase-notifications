import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TogglePushComponent } from './toggle-push.component';

describe('TogglePushComponent', () => {
  let component: TogglePushComponent;
  let fixture: ComponentFixture<TogglePushComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TogglePushComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TogglePushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
