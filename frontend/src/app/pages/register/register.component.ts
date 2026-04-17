import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      alert('Please fill all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost:5000/api/auth/register', {
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        alert('Account created successfully');
        this.router.navigate(['/']);
      },
      error: (err) => {
        alert(err.error?.message || 'Registration failed');
        this.loading = false;
      }
    });
  }
}
