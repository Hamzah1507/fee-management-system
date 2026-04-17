import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Topbar } from '../../components/layout/topbar/topbar';

@Component({
  selector: 'app-currency-rates',
  standalone: true,
  imports: [CommonModule, Topbar],
  templateUrl: './currency-rates.html',
  styleUrl: './currency-rates.scss'
})
export class CurrencyRatesComponent implements OnInit {
  
  rates: any[] = [];
  lastUpdated: Date = new Date();
  loading = true;
  baseCurrency = 'INR';

  currencyMeta: any = {
    'USD': { name: 'US Dollar', flag: '🇺🇸' },
    'EUR': { name: 'Euro', flag: '🇪🇺' },
    'GBP': { name: 'British Pound', flag: '🇬🇧' },
    'JPY': { name: 'Japanese Yen', flag: '🇯🇵' },
    'SGD': { name: 'Singapore Dollar', flag: '🇸🇬' },
    'CAD': { name: 'Canadian Dollar', flag: '🇨🇦' },
    'AUD': { name: 'Australian Dollar', flag: '🇦🇺' },
    'INR': { name: 'Indian Rupee', flag: '🇮🇳' }
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchRates(this.baseCurrency);
  }

  fetchRates(base: string = this.baseCurrency): void {
    this.baseCurrency = base;
    this.loading = true;
    this.rates = [];
    this.cdr.detectChanges();

    this.http.get<any>(`/api/frankfurter/latest?from=${base}`).subscribe({
      next: (res) => {
        console.log('API Response:', res); // 👈 Check F12 Console

        if (!res || !res.rates) {
          console.error('No rates in response', res);
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const allTarget = ['USD', 'EUR', 'GBP', 'JPY', 'SGD', 'CAD', 'AUD', 'INR'];
        
        this.rates = allTarget
          .filter(code => code !== base)
          .map(code => ({
            code,
            name: this.currencyMeta[code]?.name || code,
            flag: this.currencyMeta[code]?.flag || '🏳️',
            rate: res.rates[code]
          }))
          .filter(item => item.rate !== undefined && item.rate !== null);

        console.log('Parsed rates:', this.rates); // 👈 Should show 7 items

        this.lastUpdated = new Date();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error:', err); // 👈 Check this for CORS/network error
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  switchBase(code: string): void {
    this.fetchRates(code);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}