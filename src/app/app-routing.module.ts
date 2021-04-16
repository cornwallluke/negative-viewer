import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AlbumUploaderComponent } from './album-uploader/album-uploader.component';
import { AlbumComponent } from './album/album.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {path:"", component:HomeComponent},
  {path:"album/:name", component:AlbumComponent},
  {path:"upload", component:AlbumUploaderComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
