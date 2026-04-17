import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-collect-fee',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule],
  templateUrl: './collect-fee.component.html',
  styleUrls: ['./collect-fee.component.scss']
})
export class CollectFeeComponent implements OnInit {

  student: any = null;
  loading = true;
  submitting = false;
  successMessage = '';
  errorMessage = '';
  studentId = '';

  feeForm!: FormGroup;

  paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';

    this.feeForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      paymentMethod: ['Cash', Validators.required]
    });

    this.loadStudent();
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadStudent(): void {
    this.http.get<any>(`http://localhost:5000/api/students/${this.studentId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.student = res;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loading = false; }
      });
  }

  getPending(): number {
    if (!this.student) return 0;
    return (this.student.totalFees || 0) - (this.student.paidFees || 0);
  }

  getPaidPercent(): number {
    if (!this.student?.totalFees) return 0;
    return Math.min(100, Math.round((this.student.paidFees / this.student.totalFees) * 100));
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  submit(): void {
    if (this.feeForm.invalid) return;

    const amount = Number(this.feeForm.value.amount);
    if (amount > this.getPending()) {
      this.errorMessage = `Amount cannot exceed pending amount ₹${this.getPending()}`;
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = {
      studentId: this.studentId,
      amount,
      paymentMethod: this.feeForm.value.paymentMethod
    };

    this.http.post('http://localhost:5000/api/payments', payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = `₹${amount} collected successfully! 🎉`;
          this.feeForm.reset({ amount: 0, paymentMethod: 'Cash' });
          // Reload student to update amounts
          this.loadStudent();
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/student', this.studentId]), 1500);
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err.error?.message || 'Payment failed. Try again.';
          this.cdr.detectChanges();
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/student', this.studentId]);
  }
}