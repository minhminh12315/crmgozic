import { Component } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  imports: [],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
  activeMenu = 'dashboard';

  setActive(menu: string) {
    this.activeMenu = menu;
  }
}
