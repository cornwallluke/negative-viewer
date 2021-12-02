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
  orphans:{id:string, LastModified:Date, selected?:boolean}[] = []
  typedName:string = ""
  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.http.get(environment.api+"/getOrphans").subscribe((resp:any)=>{
      console.log(resp)
      this.orphans.push(...resp.map((item:any) => {
        item.LastModified = new Date(item.LastModified)
        return item
      }))
    })
  }
  fileSelected(event:Event){
    const fs = event.target as HTMLInputElement;
    this.selectedFiles = fs.files || undefined;
  }
  doUpload() {
    
    for (let i = 0; i < (this.selectedFiles?.length ?? 0); i++) {
      this.http.get(environment.api+`/getUploadLink`).subscribe((resp:any) => {
        const formdata = new FormData();
        Object.keys(resp.url.fields).forEach(key => {
          formdata.append(key, resp.url.fields[key]);
        })
        formdata.append("file",  this.selectedFiles![i], i.toString());
        // formdata.append("album", this.albumName!);
        // formdata.append("negative", this.negative!.toString())
        this.http.post(resp.url.url, formdata).subscribe((resp2) => {
          console.log(resp2)
        })
      })
    }
  }
  toggleSelected(id:string){
    let orphan = this.orphans.find(item => item.id === id)
    if(orphan){
      orphan.selected = !(orphan.selected ?? false )
    }
  }

  assignAlbumToSelected(){
    this.http.post(environment.api+`/assignAlbum`, {
      "album":this.typedName,
      "images": this.orphans.filter((orphan) => orphan.selected).map((orphan) => orphan.id)
    }).subscribe((resp:any) => {

    })
  }
}
