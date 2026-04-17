import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar implements OnInit {

  @Input() title = 'Dashboard';
  firstName = 'Admin';

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const fullName = payload.name || payload.username || payload.email || 'Admin';
        this.firstName = fullName.split(' ')[0];
      } catch {
        this.firstName = 'Admin';
      }
    }
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
}