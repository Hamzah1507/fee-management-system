import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, DatePipe],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {

  student: any = null;
  payments: any[] = [];
  loading = true;
  studentId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
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
      .subscribe({ next: (res) => { this.student = res; this.cdr.detectChanges(); } });
  }

  loadPayments(): void {
    this.http.get<any[]>(`http://localhost:5000/api/payments/${this.studentId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.payments = (res || []).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loading = false; }
      });
  }

  getTotalPaid(): number {
    return this.payments.reduce((s, p) => s + (p.amount || 0), 0);
  }

  getMethodIcon(method: string): string {
    const icons: any = {
      'Cash': '💵', 'UPI': '📱', 'Bank Transfer': '🏦',
      'Cheque': '📝', 'Card': '💳'
    };
    return icons[method] || '💰';
  }

  goBack(): void {
    this.router.navigate(['/student', this.studentId]);
  }
}