import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Topbar } from '../../components/layout/topbar/topbar';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, Topbar],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusDonut') statusDonutRef!: ElementRef<HTMLCanvasElement>;

  data: any = null;
  loading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadAnalytics(): void {
    this.http.get<any>('http://localhost:5000/api/analytics', { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.data = res;
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.drawBarChart();
            this.drawDonutChart(this.donutChartRef, 90);
            this.drawDonutChart(this.statusDonutRef, 120);
          }, 150);
        },
        error: (err) => { console.error(err); this.loading = false; }
      });
  }

  formatAmount(amount: number): string {
    if (!amount) return '₹0';
    if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
    if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'K';
    return '₹' + amount;
  }

  getCourseColor(percent: number): string {
    if (percent >= 100) return '#16a34a';
    if (percent >= 50) return '#3b5fc0';
    return '#d97706';
  }

  drawBarChart(): void {
    const canvas = this.barChartRef?.nativeElement;
    if (!canvas || !this.data?.monthlyData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.data.monthlyData;
    const W = canvas.width = canvas.offsetWidth || 500;
    const H = canvas.height = 180;
    const max = Math.max(...data.map((d: any) => d.amount), 1);
    const slotW = Math.floor(W / data.length);
    const barW = Math.max(slotW - 16, 10);

    ctx.clearRect(0, 0, W, H);

    data.forEach((d: any, i: number) => {
      const barH = Math.round((d.amount / max) * 130);
      const x = i * slotW + (slotW - barW) / 2;
      const y = H - 30 - barH;

      const grad = ctx.createLinearGradient(0, y, 0, H - 30);
      grad.addColorStop(0, '#3b5fc0');
      grad.addColorStop(1, '#93c5fd');
      ctx.fillStyle = d.amount > 0 ? grad : '#f1f5f9';
      ctx.beginPath();
      (ctx as any).roundRect(x, y, barW, Math.max(barH, 4), 6);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW / 2, H - 8);
    });
  }

  drawDonutChart(ref: ElementRef<HTMLCanvasElement>, size: number): void {
    const canvas = ref?.nativeElement;
    if (!canvas || !this.data) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.height = size;
    const cx = size / 2, cy = size / 2;
    const r = size * 0.42;
    const inner = size * 0.26;

    const paid = this.data.fullyPaid || 0;
    const partial = this.data.partial || 0;
    const overdue = this.data.overdue || 0;
    const total = paid + partial + overdue || 1;

    const segments = [
      { value: paid, color: '#16a34a' },
      { value: partial, color: '#f59e0b' },
      { value: overdue, color: '#ef4444' }
    ];

    ctx.clearRect(0, 0, size, size);

    if (paid + partial + overdue === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fill();
    } else {
      let startAngle = -Math.PI / 2;
      segments.forEach(seg => {
        const slice = (seg.value / total) * 2 * Math.PI;
        if (slice === 0) return;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        startAngle += slice;
      });
    }

    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
    ctx.fillStyle = size === 90 ? 'transparent' : 'white';
    ctx.fill();
  }

  goBack(): void { this.router.navigate(['/dashboard']); }

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