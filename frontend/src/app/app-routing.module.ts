import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { TestListComponent } from './components/test-list/test-list.component';
import { NewTestFormComponent } from './components/new-test-form/new-test-form.component';
import { TestPushDetailsComponent } from './components/test-push-details/test-push-details.component';

const appRoutes: Routes = [
  { path: 'test',     component: NewTestFormComponent },
  { path: 'test/:id', component: TestPushDetailsComponent },
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
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}