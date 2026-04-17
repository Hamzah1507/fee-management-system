import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './import-students.component.html',
  styleUrls: ['./import-students.component.scss']
})
export class ImportStudentsComponent implements OnInit {
  selectedFile: File | null = null;
  fileForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  importErrors: any[] = [];
  validCount = 0;
  showErrors = false;

  API_URL = 'http://localhost:5000/api/students';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fileForm = this.fb.group({
      file: ['', Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.selectedFile = null;
      this.errorMessage = 'Please select a valid CSV file';
    }
  }

  downloadTemplate(): void {
    const csvContent = 'name,email,phone,course,semester,dueDate,totalFees,paid\nJohn Doe,john@example.com,9876543210,BSC,1,15-12-2025,50000,0';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students-template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.importErrors = [];
    this.showErrors = false;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Use the direct import endpoint (no auth needed)
    this.http.post<any>(`http://localhost:5000/api/import`, formData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = response.message || `✅ Successfully imported ${response.count} students!`;
          this.selectedFile = null;
          
          // Reset file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';

          // Redirect to dashboard after 1 second
          setTimeout(() => this.router.navigate(['/dashboard']), 1000);
        },
        error: (err) => {
          this.loading = false;
          const errorResponse = err.error;
          
          if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
            this.importErrors = errorResponse.errors;
            this.validCount = errorResponse.validCount || 0;
            this.showErrors = true;
            this.errorMessage = errorResponse.message || 'Import failed with validation errors';
          } else {
            this.errorMessage = errorResponse.error || errorResponse.message || 'Failed to upload file. Please try again.';
          }
        }
      });
  }

  retryUpload(): void {
    this.selectedFile = null;
    this.importErrors = [];
    this.showErrors = false;
    this.errorMessage = '';
  }
}
