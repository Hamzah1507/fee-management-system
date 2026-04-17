import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.scss']
})
export class AddStudentComponent implements OnInit {

  loading = false;
  successMessage = '';
  remaining = 0;

  studentForm!: FormGroup;
  API_URL = 'http://localhost:5000/api/students';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.studentForm = this.fb.group({
      name: ['', Validators.required],
      course: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      semester: [''],
      dueDate: [''],
      totalFees: [0, [Validators.required, Validators.min(0)]],
      paid: [0, [Validators.required, Validators.min(0)]],
    });

    this.studentForm.valueChanges.subscribe(() => {
      const total = Number(this.studentForm.get('totalFees')?.value || 0);
      const paid = Number(this.studentForm.get('paid')?.value || 0);
      this.remaining = total - paid;
    });
  }

  submit() {
    if (this.studentForm.invalid) return;

    this.loading = true;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const payload = {
      name: this.studentForm.value.name,
      email: this.studentForm.value.email,
      phone: this.studentForm.value.phone,
      course: this.studentForm.value.course,
      semester: this.studentForm.value.semester,
      dueDate: this.studentForm.value.dueDate || null,
      totalFees: this.studentForm.value.totalFees,
      paid: this.studentForm.value.paid
    };

    this.http.post(this.API_URL, payload, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Student Added Successfully 🎉';
          this.studentForm.reset();
          this.remaining = 0;
          setTimeout(() => this.router.navigate(['/dashboard']), 1000);
        },
        error: (err) => {
          this.loading = false;
          console.error(err);
          alert('Unauthorized or server error');
        }
      });
  }
}