import { TestFirebaseNotificationsPage } from './app.po';

describe('test-firebase-notifications App', () => {
  let page: TestFirebaseNotificationsPage;

  beforeEach(() => {
    page = new TestFirebaseNotificationsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
