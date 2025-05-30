import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-in',
  imports: [],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  username = '';
  password = '';
  error = '';
  constructor(private router: Router, private authService: AuthService) { }
  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.router.navigate(['/dashboard']);
        console.log('login successfully!')
        console.log(res)
      },
      error: () => {
        this.error = 'Sai tài khoản hoặc mật khẩu!';
      }
    })
  }
}
