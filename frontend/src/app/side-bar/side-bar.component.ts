import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-side-bar',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
    activeMenu: string = '';

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    setActive(menuItem: string) {
        this.activeMenu = menuItem;
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                console.log('Logged out successfully');
                this.router.navigate(['/sign-in']);
            },
            error: (error) => {
                console.error('Logout failed:', error);
            }
        });
    }
}
