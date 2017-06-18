import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPushDataComponent } from './test-push-data.component';

describe('TestPushDataComponent', () => {
  let component: TestPushDataComponent;
  let fixture: ComponentFixture<TestPushDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestPushDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPushDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
