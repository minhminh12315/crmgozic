import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.css'
})
export class SignInComponent {
    loginForm: FormGroup;
    error: string = '';
    isLoading: boolean = false;

    constructor(
        private router: Router,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]],
            rememberMe: [false]
        });
    }

    login() {
        if (this.loginForm.invalid) {
            this.error = 'Please enter both username and password';
            return;
        }

        this.error = '';
        this.isLoading = true;

        const { username, password } = this.loginForm.value;

        this.authService.login(username, password).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.error?.error) {
                    this.error = err.error.error;
                } else if (err.status === 400) {
                    this.error = 'Invalid username or password';
                } else {
                    this.error = 'An error occurred during login';
                }
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }
}
