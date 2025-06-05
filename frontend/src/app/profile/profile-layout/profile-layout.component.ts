import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profile-layout',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent {
  constructor(private router: Router) { }
  activeNav: string = 'projects';
  isSetting: boolean = false;
  setActive(menuItem: string) {
    this.activeNav = menuItem;
  }
  ngOnInit() {
    this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('project')) {
        this.activeNav = 'projects'
        this.isSetting = false
      }
      else if (url.includes('team')) {
        this.activeNav = 'team'
        this.isSetting = false
      }
      else if (url.includes('setting')) {
        this.isSetting = true
      }
      else if (url.includes('vacations')) {
        this.activeNav = 'vacations'
        this.isSetting = false
      }

    });
  }
}
