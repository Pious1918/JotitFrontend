import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/common/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet ,HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'jotitFrontend';
  showHeader =true
  constructor(private _router:Router){

  }
  ngOnInit(): void {
    this._router.events.subscribe(event=>{
      if(event instanceof NavigationEnd){
        this.showHeader = event.url!== '/login';
      }
    })
  }
}
