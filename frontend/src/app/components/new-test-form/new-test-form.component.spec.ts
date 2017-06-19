import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPushFormComponent } from './test-push-form.component';

describe('TestPushFormComponent', () => {
  let component: TestPushFormComponent;
  let fixture: ComponentFixture<TestPushFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestPushFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPushFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
