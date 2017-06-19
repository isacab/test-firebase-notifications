import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPushDetailsComponent } from './test-push-details.component';

describe('TestPushDetailsComponent', () => {
  let component: TestPushDetailsComponent;
  let fixture: ComponentFixture<TestPushDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestPushDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPushDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
