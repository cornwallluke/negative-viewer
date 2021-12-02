import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { fromEvent } from 'rxjs';
import { auditTime, debounceTime, first, map, takeWhile } from 'rxjs/operators'

class imRef{
  url?:string;
  shown:boolean;
  bluramt:number;
  showing:boolean;
  constructor(url?:string) {
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
  zoomratio = 1;
  lightBoxed:imRef = new imRef("");
  editing = true;

  lastMdown = 0;
  
  carousel:Element | undefined;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    var holder = document.querySelector('#holder');
    
    if(holder){
      const hwheel = fromEvent(holder, 'wheel')
      hwheel.pipe(
        debounceTime(100),
        map((event)=>{
          const wheelevent = event as WheelEvent
          
          const nextPos:number = holder!.scrollLeft + (wheelevent.deltaY > 0 ? 1 : -1)*window.innerWidth * IMWIDTH;
          holder?.scroll({top:0, left:nextPos, behavior:'smooth'})
        })
      ).subscribe();
      const src = fromEvent(holder!, 'scroll');
      src.pipe(
        takeWhile(()=>this.alive),
        auditTime(50),
        map((event)=>{
          // console.log(event);
          const target = event.target as HTMLElement;
          // console.log(target.scrollWidth, target.scrollLeft);
          
          if(this.allLoaded) return;
          const toshow = Math.min(this.images.length-1, target.scrollLeft / (window.innerWidth * IMWIDTH)+ 3)
          for(let i = 0; i <= toshow; i++){
            this.images[i].shown = true;
          }
    
          
          this.allLoaded=this.images.every((im)=>im.shown);
        
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
        this.zoomratio *= wEvent.deltaY > 0 ? 1.1 : 1/1.1
        event.preventDefault();

      })
    }

    const routeParams = this.route.snapshot.paramMap;
    this.name = routeParams.get("name") || undefined;
    if(this.name){
      const url = environment.api+"/albums/"+this.name
      this.http.get(url).subscribe((resp:any)=>{
        this.images = new Array(resp.images).fill("").map((_, index)=>{
          const newRef = new imRef();
          newRef.shown = index <3;  
          this.http.get(environment.api+"/albums/"+this.name+"/"+index).pipe(first()).subscribe((resp:any) => {
            newRef.url = resp.url;
            
          })
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
    this.zoomratio = 1;
  }
  // closeLightBox(event:MouseEvent) {
  //   console.log(event);
  // }
  filtersFromBlur(blur:number):string {
    const shad = Math.max(30-Math.abs(blur)*30, 0);
    let opt = "";
    opt = `drop-shadow(${blur*70+20}px ${shad*1.3}px ${Math.abs(shad/3)}px #0F0F0FAA)`;
    return `
      blur(${Math.abs(blur*8)}px) 
      grayscale(${Math.abs(blur)*70}%)` + opt;
  }

  scaleFromBlur(blur:number):string {
    return `scale(${Math.max(1.1-Math.abs(blur*.2), 0.9)})`;
  }
  lightboxDown() {
    this.lastMdown = new Date().getTime();
  }
  lightboxUp() {
    if(new Date().getTime() - this.lastMdown < 300 || new Date().getTime() - (this.lastPinch || 0) < 300) {
      this.lightBoxing = false;
    }
  }

  pgap:number|undefined;
  pinching(event: TouchEvent) {
    if(event.touches.length == 2) {

    // window.alert("yooo");
      const gap = Math.sqrt((event.touches[0].screenX-event.touches[1].screenX)**2+(event.touches[0].screenY-event.touches[1].screenY)**2);
      if(this.pgap && Math.abs(gap-this.pgap)/gap < 0.1) {
        this.zoomratio *= gap/this.pgap;
      }
      this.pgap = gap;

    }
  }
  ploc:[number, number]|undefined;
  lastPinch:number|undefined;
  dragscrolling(event: MouseEvent) {
    // console.log(event);
    const tar = event.target as HTMLElement;
    const loc:[number, number] = [event.screenX, event.screenY]
    if(this.ploc && Math.sqrt((this.ploc[0]-loc[0])**2+(this.ploc[1]-loc[1])**2) < 10){
      tar.parentElement!.scrollBy({left: this.ploc[0] - loc[0], top: this.ploc[1] - loc[1]});
    }
    this.ploc = loc;
    this.lastPinch = new Date().getTime();
  }
}
