import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReceiptService } from '../../services/receipt.service';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [CommonModule, NgIf, DatePipe, RouterModule],
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.scss']
})
export class StudentDetailsComponent implements OnInit {

  student: any = null;
  payments: any[] = [];
  loading = true;
  deleting = false;
  showDeleteConfirm = false;
  studentId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private receiptService: ReceiptService
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';
    this.loadStudent();
    this.loadPayments();
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadStudent(): void {
    this.http.get<any>(`http://localhost:5000/api/students/${this.studentId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => { this.student = res; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.loading = false; }
      });
  }

  loadPayments(): void {
    this.http.get<any[]>(`http://localhost:5000/api/payments/${this.studentId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => { this.payments = res || []; this.cdr.detectChanges(); },
        error: () => { this.payments = []; }
      });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatus(): string {
    if (!this.student) return 'pending';
    if (this.student.paidFees >= this.student.totalFees) return 'paid';
    if (this.student.paidFees > 0) return 'partial';
    return 'pending';
  }

  getStatusLabel(): string {
    const s = this.getStatus();
    if (s === 'paid') return 'Fully Paid';
    if (s === 'partial') return 'Partial';
    return 'Pending';
  }

  getPaidPercent(): number {
    if (!this.student?.totalFees) return 0;
    return Math.min(100, Math.round((this.student.paidFees / this.student.totalFees) * 100));
  }

  getPending(): number {
    if (!this.student) return 0;
    return (this.student.totalFees || 0) - (this.student.paidFees || 0);
  }

  getLastPayment(): any {
    if (!this.payments.length) return null;
    return this.payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  downloadLastReceipt(): void {
    const last = this.getLastPayment();
    if (!last) return;
    this.receiptService.generateReceipt(this.student, last);
  }

  goBack(): void { this.router.navigate(['/dashboard']); }
  collectFee(): void { this.router.navigate(['/collect-fee', this.studentId]); }
  editStudent(): void { this.router.navigate(['/edit-student', this.studentId]); }
  viewPaymentHistory(): void { this.router.navigate(['/payments', this.studentId]); }
  confirmDelete(): void { this.showDeleteConfirm = true; }
  cancelDelete(): void { this.showDeleteConfirm = false; }

  deleteStudent(): void {
    this.deleting = true;
    this.http.delete(`http://localhost:5000/api/students/${this.studentId}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => { this.deleting = false; this.showDeleteConfirm = false; }
      });
  }
}