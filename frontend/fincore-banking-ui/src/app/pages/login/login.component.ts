import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Handles the login form submission.
  login(): void {
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        // Stores the JWT token.
        localStorage.setItem('token', response.token);

        // Stores the logged-in user details.
        localStorage.setItem('authUser', JSON.stringify({
          userId: response.userId,
          userName: response.userName,
          email: response.email,
          role: response.role
        }));
        console.log('Login successful:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }
}