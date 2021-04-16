import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-album-uploader',
  templateUrl: './album-uploader.component.html',
  styleUrls: ['./album-uploader.component.css']
})
export class AlbumUploaderComponent implements OnInit {
  selectedFiles:FileList | undefined;
  albumName:string | undefined;
  negative:boolean | undefined;
  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
  }
  fileSelected(event:Event){
    const fs = event.target as HTMLInputElement;
    this.selectedFiles = fs.files || undefined;
  }
  doUpload() {
    const formdata = new FormData();
    for (var i = 0; i < (this.selectedFiles?.length ?? 0); i++) {
      formdata.append(i.toString(), this.selectedFiles![i], this.selectedFiles![i].name);
      formdata.append("album", this.albumName!);
      formdata.append("negative", this.negative!.toString())
    }
    this.http.post(environment.api+"/upload", formdata).subscribe((resp) => {
      console.log(resp);
    })

  }
}
