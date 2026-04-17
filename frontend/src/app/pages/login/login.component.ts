import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  email = '';
  password = '';
  showPassword = false;
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    if (!this.email.trim() || !this.password.trim()) {
      alert('Please fill all fields');
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost:5000/api/auth/login', {
      email: this.email.trim(),
      password: this.password.trim()
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert(err.error?.message || 'Login failed');
        this.loading = false;
      }
    });
  }
}
