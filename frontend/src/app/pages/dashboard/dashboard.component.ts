import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Topbar } from '../../components/layout/topbar/topbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, Topbar],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  allStudents: any[] = [];
  students: any[] = [];
  totalStudents = 0;
  totalFees = 0;
  totalCollection = 0;
  totalPending = 0;
  collectionPercent = 0;
  loading = true;
  searchQuery = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadStudents(); }

  loadStudents(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>('http://localhost:5000/api/students', { headers })
      .subscribe({
        next: (res) => {
          this.allStudents = [...res];
          this.students = [...res];
          this.calcStats();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loading = false; }
      });
  }

  calcStats(): void {
    this.totalStudents = this.allStudents.length;
    this.totalFees = this.allStudents.reduce((s, x) => s + (x.totalFees || 0), 0);
    this.totalCollection = this.allStudents.reduce((s, x) => s + (x.paidFees || 0), 0);
    this.totalPending = this.totalFees - this.totalCollection;
    this.collectionPercent = this.totalFees > 0
      ? Math.round((this.totalCollection / this.totalFees) * 100) : 0;
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.students = [...this.allStudents];
    } else {
      this.students = this.allStudents.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.course?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
      );
    }
    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.students = [...this.allStudents];
    this.cdr.detectChanges();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatus(student: any): string {
    if (!student.totalFees) return 'pending';
    if (student.paidFees >= student.totalFees) return 'paid';
    if (student.paidFees > 0) return 'partial';
    return 'pending';
  }

  getStatusLabel(student: any): string {
    const s = this.getStatus(student);
    if (s === 'paid') return 'Fully Paid';
    if (s === 'partial') return 'Partial';
    return 'Pending';
  }

  getPaidPercent(student: any): number {
    if (!student.totalFees) return 0;
    return Math.min(100, Math.round((student.paidFees / student.totalFees) * 100));
  }

  formatAmount(amount: number): string {
    if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
    if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'K';
    return '₹' + amount;
  }

  isDueSoon(student: any): boolean {
    if (!student.dueDate) return false;
    const due = new Date(student.dueDate);
    const diff = (due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7 && this.getStatus(student) !== 'paid';
  }

  goToStudent(id: string): void { this.router.navigate(['/student', id]); }

  exportFeesAsCSV(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get('http://localhost:5000/api/payments/export/all', {
      headers,
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fees-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Export failed:', err);
        alert('Failed to export fees. Please try again.');
      }
    });
  }
}