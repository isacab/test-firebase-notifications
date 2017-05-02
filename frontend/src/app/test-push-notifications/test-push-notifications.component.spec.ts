import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPushNotificationsComponent } from './test-push-notifications.component';

describe('TestPushNotificationsComponent', () => {
  let component: TestPushNotificationsComponent;
  let fixture: ComponentFixture<TestPushNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestPushNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPushNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
