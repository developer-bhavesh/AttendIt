import { PayslipData } from './payslipUtils';

export const generatePayslipHTML = (data: PayslipData, logoUri?: string): string => {
  const { employee, period, attendance, earnings, adjustments, netSalary, dailyRecords } = data;

  // Format currency
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  // Use provided logo URI or fallback to default
  const logoBase64 = logoUri || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMjUiIHk9IjIwIiB3aWR0aD0iNTAiIGhlaWdodD0iNjAiIGZpbGw9IiNGRjhBMDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSIzNSIgcj0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFGMkQzRCIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHJlY3QgeD0iNDUiIHk9IjQ1IiB3aWR0aD0iMTAiIGhlaWdodD0iMjUiIGZpbGw9IiMxRjJEM0QiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjU1IiByPSI0IiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAiIHk9IjkyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMDAwIj5BTUlUWUEgTE9DS0VSUzwvdGV4dD48L3N2Zz4=';

  // Generate daily records HTML with proper formatting
  const dailyRecordsHTML = dailyRecords
    .map((record) => {
      const dateObj = new Date(record.date);
      const day = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      
      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; text-align: center; border-right: 1px solid #ddd;">${day}</td>
          <td style="padding: 8px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; color: ${record.status === 'present' ? '#059669' : '#DC2626'};">
            ${record.status === 'present' ? 'P' : 'A'}
          </td>
          <td style="padding: 8px; text-align: center; border-right: 1px solid #ddd;">
            ${record.regularHours.toFixed(1)}
          </td>
          <td style="padding: 8px; text-align: center; border-right: 1px solid #ddd; color: ${record.overtimeHours > 0 ? '#F59E0B' : '#000'};">
            ${record.overtimeHours.toFixed(1)}
          </td>
          <td style="padding: 8px; text-align: center; border-right: 1px solid #ddd; font-weight: 600;">
            ${record.totalHours.toFixed(1)}
          </td>
          <td style="padding: 8px; text-align: right; border-right: 1px solid #ddd;">
            ${formatCurrency(record.earnings)}
          </td>
          <td style="padding: 8px; text-align: right; border-right: 1px solid #ddd; color: #059669;">
            ${record.credits > 0 ? formatCurrency(record.credits) : '-'}
          </td>
          <td style="padding: 8px; text-align: right; border-right: 1px solid #ddd; color: #DC2626;">
            ${record.debits > 0 ? formatCurrency(record.debits) : '-'}
          </td>
          <td style="padding: 8px; text-align: right; font-weight: 700; background-color: #f9fafb;">
            ${formatCurrency(record.netEarnings)}
          </td>
        </tr>
      `;
    })
    .join('');

  // Generate transactions HTML
  const transactionsHTML = [...adjustments.creditTransactions, ...adjustments.debitTransactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((transaction) => {
      const dateObj = new Date(transaction.date);
      const dayNumber = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      
      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; background-color: #f9fafb;">
            ${dayNumber}
          </td>
          <td style="padding: 8px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; color: ${transaction.type === 'credit' ? '#059669' : '#DC2626'}; background-color: #f9fafb;">
            ${transaction.type === 'credit' ? 'Credit' : 'Debit'}
          </td>
          <td style="padding: 8px; border-right: 1px solid #ddd; font-size: 10pt; background-color: #f9fafb;">
            ${transaction.description || '-'}
          </td>
          <td style="padding: 8px; text-align: right; font-weight: 700; color: ${transaction.type === 'credit' ? '#059669' : '#DC2626'}; background-color: #f9fafb;">
            ${transaction.type === 'credit' ? '+' : '-'}${formatCurrency(transaction.amount)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payslip - ${employee.name} - ${period.monthYear}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { margin: 20mm; }
        body { 
          font-family: 'Arial', 'Helvetica', sans-serif;
          background-color: #ffffff;
          color: #000000;
          font-size: 11pt;
          line-height: 1.4;
        }
        .container { 
          max-width: 210mm;
          margin: 0 auto;
          background: white;
        }
        .header { 
          border: 2px solid #000;
          padding: 15px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .logo { 
          width: 80px; 
          height: 80px;
        }
        .company-name { 
          font-size: 32px; 
          font-weight: 700; 
          color: #111827;
          margin-bottom: 8px;
        }
        .document-title { 
          font-size: 20px; 
          color: #6B7280;
          font-weight: 500;
        }
        .info-section {
          border: 2px solid #000;
          padding: 15px;
          margin-bottom: 20px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .info-item {
          display: flex;
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
        .info-label {
          font-size: 10pt;
          color: #000;
          font-weight: 700;
          min-width: 120px;
        }
        .info-label:after {
          content: ':';
          margin-left: 4px;
        }
        .info-value {
          font-size: 10pt;
          color: #000;
          font-weight: 400;
        }
        .section {
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #E5E7EB;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background-color: #ffffff;
          border: 1px solid #E5E7EB;
        }
        th {
          background-color: #F3F4F6;
          padding: 12px 8px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-box {
          background-color: #F9FAFB;
          padding: 20px;
          margin-top: 16px;
          border: 1px solid #E5E7EB;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 14px;
        }
        .summary-row.total {
          border-top: 2px solid #E5E7EB;
          padding-top: 16px;
          margin-top: 8px;
          font-size: 16px;
          font-weight: 700;
        }
        .summary-row.net {
          background-color: #ECFDF5;
          padding: 16px;
          margin-top: 12px;
          border: 2px solid #059669;
          font-size: 18px;
          font-weight: 700;
        }
        .text-green { color: #10b981; }
        .text-red { color: #ef4444; }
        .text-emerald { color: #059669; }
        .footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 2px solid #E5E7EB;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div style="width: 150px; height: 150px; border-radius: 50%; border: 3px solid #F59E0B; padding: 10px; display: flex; align-items: center; justify-content: center; background-color: #FFF;">
            <img src="${logoBase64}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" />
          </div>
          <div style="text-align: right; flex: 1;">
            <div style="font-size: 18pt; font-weight: 700; color: #000;">PAYSLIP</div>
            <div style="font-size: 10pt; color: #666; margin-top: 4px;">${period.monthYear}</div>
          </div>
        </div>

        <!-- Employee & Period Information -->
        <div class="info-section">
          <div style="background-color: #f3f4f6; padding: 10px; margin-bottom: 15px; border: 1px solid #000;">
            <strong style="font-size: 12pt;">EMPLOYEE INFORMATION</strong>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Employee Name</div>
              <div class="info-value">${employee.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Employee ID</div>
              <div class="info-value">${employee.employeeId}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Position</div>
              <div class="info-value">${employee.position}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Mobile</div>
              <div class="info-value">${employee.mobile}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Pay Period</div>
              <div class="info-value">${period.startDate} to ${period.endDate}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Working Days</div>
              <div class="info-value">${attendance.presentDays} / ${attendance.totalDays} Days</div>
            </div>
          </div>
        </div>

        <!-- Earnings Summary -->
        <div class="section">
          <div class="section-title">Earnings Summary</div>
          <div class="summary-box">
            <div class="summary-row">
              <span>Hourly Rate:</span>
              <span style="font-weight: 600;">${formatCurrency(earnings.hourlyRate)}/hr</span>
            </div>
            <div class="summary-row">
              <span>Standard Hours/Day:</span>
              <span style="font-weight: 600;">${earnings.standardHours}h</span>
            </div>
            <div class="summary-row">
              <span>Total Regular Hours:</span>
              <span style="font-weight: 600;">${earnings.regularHours.toFixed(1)}h</span>
            </div>
            <div class="summary-row">
              <span>Regular Earnings:</span>
              <span style="font-weight: 600;">${formatCurrency(earnings.regularEarnings)}</span>
            </div>
            ${earnings.overtimeHours > 0 ? `
            <div class="summary-row">
              <span>Overtime Hours:</span>
              <span style="font-weight: 600; color: #F59E0B;">${earnings.overtimeHours.toFixed(1)}h</span>
            </div>
            <div class="summary-row">
              <span>Overtime Earnings:</span>
              <span style="font-weight: 600; color: #F59E0B;">${formatCurrency(earnings.overtimeEarnings)}</span>
            </div>
            ` : ''}
            <div class="summary-row total">
              <span>Total Earnings:</span>
              <span class="text-green">${formatCurrency(earnings.totalEarnings)}</span>
            </div>
          </div>
        </div>

        <!-- Daily Attendance Report -->
        <div class="section">
          <div class="section-title">Daily Attendance & Earnings Report</div>
          <table style="border: 2px solid #000;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="text-align: center; border-right: 1px solid #ddd; padding: 10px;">Date</th>
                <th style="text-align: center; border-right: 1px solid #ddd; padding: 10px;">Status</th>
                <th style="text-align: center; border-right: 1px solid #ddd; padding: 10px;">Regular Hrs</th>
                <th style="text-align: center; border-right: 1px solid #ddd; padding: 10px;">OT Hrs</th>
                <th style="text-align: center; border-right: 1px solid #ddd; padding: 10px;">Total Hrs</th>
                <th style="text-align: right; border-right: 1px solid #ddd; padding: 10px;">Earnings</th>
                <th style="text-align: right; border-right: 1px solid #ddd; padding: 10px;">Credits</th>
                <th style="text-align: right; border-right: 1px solid #ddd; padding: 10px;">Debits</th>
                <th style="text-align: right; padding: 10px;">Net Amount</th>
              </tr>
            </thead>
            <tbody>
              ${dailyRecordsHTML}
            </tbody>
          </table>
        </div>

        <!-- Net Salary -->
        <div class="section">
          <div class="summary-box">
            <div class="summary-row net">
              <span>NET PAYABLE SALARY:</span>
              <span class="text-emerald">${formatCurrency(netSalary)}</span>
            </div>
            ${adjustments.totalCredits > 0 || adjustments.totalDebits > 0 ? `
            <div style="margin-top: 16px; padding: 12px; background-color: #F3F4F6; border-radius: 6px; font-size: 12px; color: #6B7280; font-style: italic;">
              Calculation: Total Earnings (${formatCurrency(earnings.totalEarnings)})${adjustments.totalCredits > 0 ? ` + Credits (${formatCurrency(adjustments.totalCredits)})` : ''}${adjustments.totalDebits > 0 ? ` - Deductions (${formatCurrency(adjustments.totalDebits)})` : ''} = ${formatCurrency(netSalary)}
            </div>
            ` : ''}
          </div>
        </div>

        ${adjustments.totalCredits > 0 || adjustments.totalDebits > 0 ? `
        <!-- Transaction Details -->
        <div class="section">
          <div class="section-title">Transaction Details</div>
          <table style="border: 2px solid #000;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="text-align: center; border-right: 1px solid #ddd; padding: 10px;">Date</th>
                <th style="text-align: center; border-right: 1px solid #ddd; padding: 10px;">Type</th>
                <th style="text-align: left; border-right: 1px solid #ddd; padding: 10px;">Description / Note</th>
                <th style="text-align: right; padding: 10px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactionsHTML}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <p>This is a computer-generated payslip and does not require a signature.</p>
          <p style="margin-top: 8px;">Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p style="margin-top: 16px; font-weight: 600;">Amitya Locker - Employee Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
