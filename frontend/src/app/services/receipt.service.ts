import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReceiptService {

  generateReceipt(student: any, payment: any): void {
    const receiptNo = payment.receiptNumber || Date.now().toString();
    const date = new Date(payment.createdAt || Date.now());
    const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fee Receipt - ${student.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
    .receipt { width: 700px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }

    /* HEADER */
    .header {
      background: linear-gradient(135deg, #1e3a8a, #2563eb);
      padding: 20px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-logo { display: flex; align-items: center; gap: 12px; }
    .logo-box {
      width: 60px; height: 60px; background: white; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 900; color: #1e3a8a;
    }
    .logo-text { color: white; }
    .logo-text .university { font-size: 18px; font-weight: 800; letter-spacing: 1px; }
    .logo-text .tagline { font-size: 10px; opacity: 0.8; margin-top: 2px; }
    .header-right { text-align: right; color: white; }
    .receipt-label { font-size: 20px; font-weight: 800; color: #fbbf24; letter-spacing: 2px; }
    .receipt-no { font-size: 11px; opacity: 0.8; margin-top: 4px; }

    /* GOLD DIVIDER */
    .gold-bar { height: 4px; background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24); }

    /* META ROW */
    .meta-row {
      display: flex; justify-content: space-between;
      background: #f8fafc; padding: 14px 28px;
      border-bottom: 1px solid #e2e8f0;
    }
    .meta-item { text-align: center; }
    .meta-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .meta-value { font-size: 14px; font-weight: 700; color: #1e293b; }
    .meta-value.blue { color: #2563eb; }

    /* BODY */
    .body { padding: 24px 28px; }

    .section-title {
      font-size: 11px; font-weight: 700; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 12px; padding-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
    }

    /* STUDENT DETAILS */
    .details-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 0; border: 1px solid #e2e8f0; border-radius: 8px;
      overflow: hidden; margin-bottom: 20px;
    }
    .detail-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px; background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 12px; color: #94a3b8; }
    .detail-value { font-size: 13px; font-weight: 600; color: #1e293b; }

    /* PAYMENT TABLE */
    .payment-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border-radius: 8px; overflow: hidden; }
    .payment-table thead tr { background: #1e3a8a; color: white; }
    .payment-table th { padding: 10px 14px; font-size: 12px; font-weight: 600; text-align: left; }
    .payment-table td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .payment-table tbody tr:last-child td { border-bottom: none; }
    .payment-table .amount-row { background: #fef3c7; }
    .payment-table .amount-row td { font-weight: 700; color: #92400e; }

    /* SUMMARY */
    .summary-box { background: #f8fafc; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }
    .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
    .summary-row.total { border-top: 1px solid #e2e8f0; margin-top: 6px; padding-top: 10px; font-weight: 700; font-size: 14px; }
    .green { color: #16a34a; }
    .red { color: #dc2626; }

    /* FOOTER */
    .footer {
      background: #1e3a8a; padding: 16px 28px;
      display: flex; justify-content: space-between; align-items: flex-end;
    }
    .footer-left { color: rgba(255,255,255,0.7); font-size: 11px; line-height: 1.6; }
    .footer-right { text-align: right; }
    .signature-line { width: 140px; border-top: 1px solid rgba(255,255,255,0.5); padding-top: 6px; color: rgba(255,255,255,0.7); font-size: 11px; text-align: center; }
    .disclaimer { background: #f8fafc; padding: 8px 28px; text-align: center; font-size: 10px; color: #94a3b8; }
    .gls-footer { background: #1e3a8a; padding: 8px 28px; text-align: center; font-size: 11px; color: rgba(255,255,255,0.6); }
  </style>
</head>
<body>
<div class="receipt">

  <!-- HEADER -->
  <div class="header">
    <div class="header-logo">
      <div class="logo-box">GLS</div>
      <div class="logo-text">
        <div class="university">GLS UNIVERSITY</div>
        <div class="tagline">Promoted by Gujarat Law Society Since 1927</div>
      </div>
    </div>
    <div class="header-right">
      <div class="receipt-label">FEE RECEIPT</div>
      <div class="receipt-no">GLS/${new Date().getFullYear()}/${receiptNo.slice(-8).toUpperCase()}</div>
    </div>
  </div>

  <div class="gold-bar"></div>

  <!-- META ROW -->
  <div class="meta-row">
    <div class="meta-item">
      <div class="meta-label">Date</div>
      <div class="meta-value">${dateStr}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Semester</div>
      <div class="meta-value blue">${student.semester ? 'Semester ' + student.semester : '—'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Method</div>
      <div class="meta-value">${payment.paymentMethod || 'Cash'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Receipt No</div>
      <div class="meta-value">${receiptNo.slice(-8).toUpperCase()}</div>
    </div>
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- STUDENT DETAILS -->
    <div class="section-title">Student Details</div>
    <div class="details-grid">
      <div class="detail-row">
        <span class="detail-label">Student Name</span>
        <span class="detail-value">${student.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Course / Program</span>
        <span class="detail-value">${student.course}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">${student.email || '—'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phone</span>
        <span class="detail-value">${student.phone || '—'}</span>
      </div>
    </div>

    <!-- PAYMENT DETAILS -->
    <div class="section-title">Payment Details</div>
    <table class="payment-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Semester</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Tuition Fee Payment</td>
          <td>${student.semester ? 'Sem ' + student.semester : '—'}</td>
          <td>Rs. ${payment.amount}</td>
        </tr>
        <tr class="amount-row">
          <td><strong>Amount Paid</strong></td>
          <td></td>
          <td><strong>Rs. ${payment.amount}</strong></td>
        </tr>
      </tbody>
    </table>

    <!-- SUMMARY -->
    <div class="summary-box">
      <div class="summary-row">
        <span>Total Course Fees</span>
        <span>Rs. ${student.totalFees || 0}</span>
      </div>
      <div class="summary-row">
        <span>Total Paid (till date)</span>
        <span class="green">Rs. ${student.paidFees || 0}</span>
      </div>
      <div class="summary-row total">
        <span>Balance Pending</span>
        <span class="${(student.totalFees - student.paidFees) <= 0 ? 'green' : 'red'}">Rs. ${Math.max(0, (student.totalFees || 0) - (student.paidFees || 0))}</span>
      </div>
    </div>

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">
      GLS University, Law Garden,<br>
      Navrangpura, Ahmedabad - 380009
    </div>
    <div class="footer-right">
      <div class="signature-line">Authorised Signatory</div>
    </div>
  </div>

  <div class="disclaimer">This is a computer-generated receipt and does not require a physical signature</div>
  <div class="gls-footer">Promoted by Gujarat Law Society Since 1927 | www.glsuniversity.ac.in</div>

</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }
}