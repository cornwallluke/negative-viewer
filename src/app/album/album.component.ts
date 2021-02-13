import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { fromEvent } from 'rxjs';
import { auditTime, map, takeWhile } from 'rxjs/operators'

class imRef{
  url:string;
  shown:boolean;
  bluramt:number;
  showing:boolean;
  constructor(url:string) {
    this.url = url;
    this.shown = false;
    this.showing = false;
    this.bluramt = 0;
  }
}

const IMWIDTH = 0.72
@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})
export class AlbumComponent implements OnInit {
  alive = true;
  allLoaded = false;
  @Input() name:string | undefined;
  images:imRef[] = [];

  lightBoxing:boolean = false;
  lightBoxed:imRef = new imRef("");
  editing = true;
  
  carousel:Element | undefined;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    var holder = document.querySelector('#holder');
    
    if(holder){
      holder.addEventListener('wheel', (event)=>{
        const wheelevent = event as WheelEvent
        
        const nextPos:number = holder!.scrollLeft + (wheelevent.deltaY > 0 ? 1 : -1)*window.innerWidth * IMWIDTH;
        holder?.scroll({top:0, left:nextPos, behavior:'smooth'})
      });
      const src = fromEvent(holder!, 'scroll');
      src.pipe(
        takeWhile(()=>this.alive),
        auditTime(50),
        map((event)=>{
          // console.log(event);
          const target = event.target as HTMLElement;
          // console.log(target.scrollWidth, target.scrollLeft);
          
          if(this.allLoaded) return;
    
          for(let i = 0; i <= target.scrollLeft / (window.innerWidth * IMWIDTH)+ 3; i++){
            this.images[i].shown = true;
          }
    
          
          this.allLoaded=this.images.every((_, val)=>val);
        
        })
      ).subscribe();
      src.pipe(
        // auditTime(3),
        map((event)=>{
          this.images.forEach((im, index)=>{
            const target = event.target as HTMLElement;
            // console.log(Math.abs(index - target.scrollLeft / (window.innerWidth * IMWIDTH)));
            im.bluramt = index - target.scrollLeft / (window.innerWidth * IMWIDTH);
            im.bluramt = Math.abs(im.bluramt) < 0.1 ? 0 : im.bluramt
            im.showing = Math.abs(im.bluramt)<3;
          });
        })
      ).subscribe();

    }
    
    const lightBox = document.querySelector("#mylightBox");

    if(lightBox){
      lightBox.addEventListener("wheel", (event)=>{
        const wEvent = event as WheelEvent;
        console.log(wEvent.deltaY);

      })
    }

    const routeParams = this.route.snapshot.paramMap;
    this.name = routeParams.get("name") || undefined;
    if(this.name){
      const url = environment.api+"/picture/"+this.name
      this.http.get(url).subscribe((resp:any)=>{
        this.images = new Array(resp.images).fill("").map((_, index)=>{
          const newRef = new imRef(environment.api+"/picture/"+this.name+"/"+index);
          newRef.shown = index <3;
          return newRef;
        })
        this.images.forEach((im, index)=>{
          im.bluramt = index - holder!.scrollLeft / (window.innerWidth * IMWIDTH);
          im.showing = Math.abs(im.bluramt)<3;
        });
      })
    }

    
  }
  ngOnDestroy() {
    this.alive = false;
  }
  openLightBox(event:MouseEvent, image:imRef) {
    this.lightBoxing = true;
    this.lightBoxed.url = image.url;
  }
  // closeLightBox(event:MouseEvent) {
  //   console.log(event);
  // }
  filtersFromBlur(blur:number):string {
    const shad = Math.max(30-Math.abs(blur)*30, 0);
    let opt = "";
    opt = `blur(${Math.abs(blur*8)}px) drop-shadow(${blur*70+20}px ${shad*1.3}px ${Math.abs(shad/3)}px #0F0F0FAA)`;
    return `
      grayscale(${Math.abs(blur)*70}%)` + opt;
  }

  scaleFromBlur(blur:number):string {
    return `scale(${Math.max(1.1-Math.abs(blur*.2), 0.9)})`;
  }
}
