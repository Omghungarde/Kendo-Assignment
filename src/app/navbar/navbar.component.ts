import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [ RouterOutlet],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  // navbarOpen = false;

  // toggleNavbar() {
  //   this.navbarOpen = !this.navbarOpen;
  // }
  
}
