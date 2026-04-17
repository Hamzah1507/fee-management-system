import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Topbar } from '../../components/layout/topbar/topbar';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, Topbar],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  loading = false;
  analytics: any = null;
  recentTransactions: any[] = [];
  totalTransactions = 0;
  adminName = 'Admin';
  adminEmail = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.decodeToken();
    this.loadAnalytics();
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  decodeToken(): void {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.adminName = payload.name || 'Admin';
        this.adminEmail = payload.email || '';
      }
    } catch { }
  }

  loadAnalytics(): void {
    this.http.get<any>('http://localhost:5000/api/analytics', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.analytics = data;
        this.recentTransactions = data.recentTransactions || [];
        this.totalTransactions = data.recentTransactions?.length || 0; // Or better, fetch total from backend if needed
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Analytics error:', err);
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatAmount(amount: number): string {
    if (!amount) return '₹0';
    if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
    if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'K';
    return '₹' + amount;
  }

  getPercent(part: number, total: number): number {
    if (!total || !part) return 0;
    return Math.round((part / total) * 100);
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}