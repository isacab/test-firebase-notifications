import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnablePushComponent } from './enable-push.component';

describe('EnablePushComponent', () => {
  let component: EnablePushComponent;
  let fixture: ComponentFixture<EnablePushComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnablePushComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnablePushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
