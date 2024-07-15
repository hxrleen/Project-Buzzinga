import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FirstPageComponent } from './first-page/first-page.component';
import { BuzzComponent } from './buzz/buzz.component';
import { RoomComponent } from './room/room.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: FirstPageComponent },
  { path: 'buzz', component: BuzzComponent },
  // { path: 'buzz/room', component: BuzzComponent },
  {
    path: 'buzz/room/:roomId',
    component: RoomComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
