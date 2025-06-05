import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [SideBarComponent, CommonModule, RouterModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    currentUsername: string = '';

    constructor(private authService: AuthService) {
        // Get initial user state
        const currentUser = this.authService.getCurrentUser();
        console.log(currentUser)
        if (currentUser) {
            this.currentUsername = currentUser.username;
        }
    }

    ngOnInit() {
        // Subscribe to auth changes
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.currentUsername = user.username;
                // console.log('Current user in header:', this.currentUsername);
            } else {
                this.currentUsername = '';
            }
        });
    }
}
