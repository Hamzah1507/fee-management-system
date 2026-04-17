import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
    selector: 'app-edit-student',
    standalone: true,
    imports: [CommonModule, NgIf, ReactiveFormsModule],
    templateUrl: './edit-student.component.html',
    styleUrls: ['./edit-student.component.scss']
})
export class EditStudentComponent implements OnInit {

    studentForm!: FormGroup;
    loading = true;
    saving = false;
    successMessage = '';
    errorMessage = '';
    studentId = '';
    remaining = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.studentId = this.route.snapshot.paramMap.get('id') || '';

        this.studentForm = this.fb.group({
            name: ['', Validators.required],
            course: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            semester: [''],
            dueDate: [''],
            totalFees: [0, [Validators.required, Validators.min(0)]],
            paidFees: [0, [Validators.required, Validators.min(0)]],
        });

        this.studentForm.valueChanges.subscribe(() => {
            const total = Number(this.studentForm.get('totalFees')?.value || 0);
            const paid = Number(this.studentForm.get('paidFees')?.value || 0);
            this.remaining = total - paid;
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
                next: (s) => {
                    this.studentForm.patchValue({
                        name: s.name,
                        course: s.course,
                        email: s.email,
                        phone: s.phone,
                        semester: s.semester || '',
                        dueDate: s.dueDate ? s.dueDate.substring(0, 10) : '',
                        totalFees: s.totalFees,
                        paidFees: s.paidFees
                    });
                    this.remaining = (s.totalFees || 0) - (s.paidFees || 0);
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: () => { this.loading = false; }
            });
    }

    submit(): void {
        if (this.studentForm.invalid) return;
        this.saving = true;
        this.errorMessage = '';

        this.http.put(`http://localhost:5000/api/students/${this.studentId}`, this.studentForm.value, { headers: this.getHeaders() })
            .subscribe({
                next: () => {
                    this.saving = false;
                    this.successMessage = 'Student updated successfully! ✅';
                    this.cdr.detectChanges();
                    setTimeout(() => this.router.navigate(['/student', this.studentId]), 1200);
                },
                error: (err) => {
                    this.saving = false;
                    this.errorMessage = err.error?.message || 'Update failed. Try again.';
                    this.cdr.detectChanges();
                }
            });
    }

    goBack(): void { this.router.navigate(['/student', this.studentId]); }
}