import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { TestListComponent } from './components/test-list/test-list.component';
import { NewTestFormComponent } from './components/new-test-form/new-test-form.component';
import { TestPushDetailsComponent } from './components/test-push-details/test-push-details.component';
import { TestListResolverService } from "app/services/route-guards/test-list-resolver.service";
import { TestDetailsResolverService } from "app/services/route-guards/test-details-resolver.service";
import { PingComponent } from "app/components/ping/ping.component";

const appRoutes: Routes = [
  {
    path: 'test', 
    component: NewTestFormComponent 
  },
  { 
    path: 'test/:id', 
    component: TestPushDetailsComponent,
    resolve: {
      test: TestDetailsResolverService
    }
  },
  {
    path: 'list',
    component: TestListComponent,
    resolve: {
      testList: TestListResolverService
    }
  },
  {
    path: 'ping',
    component: PingComponent
  },
  { 
    path: '',
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
  ],
  providers: [
    TestListResolverService,
    TestDetailsResolverService
  ]
})
export class AppRoutingModule {}