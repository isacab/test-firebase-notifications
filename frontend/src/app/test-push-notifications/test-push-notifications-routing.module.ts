/*import { NgModule } from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';
import { TestPushNotificationsComponent } from '../test-push-notifications/test-push-notifications.component';
import { NewTestFormComponent } from './new-test-form/new-test-form.component';
import { TestPushDetailsComponent } from './test-push-details/test-push-details.component';

const testRoutes: Routes = [
  { 
    path: 'test',     
    component: TestPushNotificationsComponent,
    children: [
      { path: ':id', component: TestPushDetailsComponent },
      { path: '**', component: NewTestFormComponent },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(testRoutes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class TestPushNotificationsRoutingModule { }
*/