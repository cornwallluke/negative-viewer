import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'photoviewer';
  ngOnInit() {
    // document.addEventListener('touchmove', (event) => {
    //   console.log(event);
    //   if(event.touches.length > 1){
    //     event.preventDefault();
    //   }
    // });
  }
}
