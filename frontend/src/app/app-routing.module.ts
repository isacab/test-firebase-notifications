import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';
import { TestListComponent } from './test-list/test-list.component';
import { TestPushNotificationsComponent } from './test-push-notifications/test-push-notifications.component';

const appRoutes: Routes = [
  { path: 'test',     component: TestPushNotificationsComponent },
  { path: 'test/:id', component: TestPushNotificationsComponent },
  {
    path: 'list',
    component: TestListComponent,
    data: { title: 'Test List' }
  },
  { path: '',
    redirectTo: '/test',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}