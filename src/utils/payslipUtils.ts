import { Employee, Transaction, MonthlyAttendance } from '../types';

export interface PayslipData {
  employee: Employee;
  period: {
    startDate: string;
    endDate: string;
    monthYear: string;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    attendancePercentage: number;
  };
  earnings: {
    hourlyRate: number;
    standardHours: number;
    regularHours: number;
    regularEarnings: number;
    overtimeHours: number;
    overtimeEarnings: number;
    totalEarnings: number;
  };
  adjustments: {
    totalCredits: number;
    totalDebits: number;
    creditTransactions: Transaction[];
    debitTransactions: Transaction[];
  };
  netSalary: number;
  dailyRecords: Array<{
    date: string;
    status: 'present' | 'absent';
    regularHours: number;
    overtimeHours: number;
    totalHours: number;
    earnings: number;
    credits: number;
    debits: number;
    netEarnings: number;
  }>;
}

export const calculatePayslipData = (
  employee: Employee,
  monthlyAttendance: MonthlyAttendance | undefined,
  transactions: Transaction[],
  dailyAttendanceData: { [date: string]: any },
  monthDates: string[],
  startDate: string,
  endDate: string
): PayslipData => {
  const standardHours = employee.standardHours || 8;
  const hourlyRate = employee.hourlyRate || 0;

  // Build daily records FIRST to calculate actual totals for the date range
  const dailyRecords = monthDates.map(date => {
    const dayNumber = new Date(date).getDate();
    
    // Get attendance data from dailyAttendanceData (works for any date range)
    const dailyRecord = dailyAttendanceData[date];
    const isPresent = dailyRecord ? true : false;
    const status: 'present' | 'absent' = isPresent ? 'present' : 'absent';
    
    let overtimeHours = 0;
    if (isPresent && dailyRecord) {
      if (typeof dailyRecord === 'object' && dailyRecord.overtimeHours) {
        overtimeHours = dailyRecord.overtimeHours;
      }
    }

    const regularHours = isPresent ? standardHours : 0;
    const totalHours = regularHours + overtimeHours;
    const regularDayEarnings = regularHours * hourlyRate;
    const overtimeDayEarnings = overtimeHours * hourlyRate;
    const dailyEarnings = regularDayEarnings + overtimeDayEarnings;

    // Get transactions for this date
    const dayTransactions = transactions.filter(t => t.date === date);
    let dayCredits = 0;
    let dayDebits = 0;
    dayTransactions.forEach(t => {
      if (t.type === 'credit') {
        dayCredits += t.amount;
      } else {
        dayDebits += t.amount;
      }
    });

    const dailyNetEarnings = dailyEarnings + dayCredits - dayDebits;

    return {
      date,
      status,
      regularHours,
      overtimeHours,
      totalHours,
      earnings: dailyEarnings,
      credits: dayCredits,
      debits: dayDebits,
      netEarnings: dailyNetEarnings,
    };
  });

  // Calculate totals from daily records (for the actual date range)
  let totalRegularHours = 0;
  let totalOvertimeHours = 0;
  let presentDays = 0;
  let totalCredits = 0;
  let totalDebits = 0;
  const creditTransactions: Transaction[] = [];
  const debitTransactions: Transaction[] = [];

  dailyRecords.forEach(record => {
    totalRegularHours += record.regularHours;
    totalOvertimeHours += record.overtimeHours;
    if (record.status === 'present') {
      presentDays++;
    }
  });

  // Filter transactions for the date range
  transactions.forEach(transaction => {
    if (transaction.type === 'credit') {
      totalCredits += transaction.amount;
      creditTransactions.push(transaction);
    } else {
      totalDebits += transaction.amount;
      debitTransactions.push(transaction);
    }
  });

  const regularEarnings = totalRegularHours * hourlyRate;
  const overtimeEarnings = totalOvertimeHours * hourlyRate;
  const totalEarnings = regularEarnings + overtimeEarnings;
  const netSalary = totalEarnings + totalCredits - totalDebits;

  // Format month-year
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  // If same month, show month name, otherwise show date range
  const monthYear = startDateObj.getMonth() === endDateObj.getMonth() && startDateObj.getFullYear() === endDateObj.getFullYear()
    ? `${monthNames[startDateObj.getMonth()]} ${startDateObj.getFullYear()}`
    : `${startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return {
    employee,
    period: {
      startDate,
      endDate,
      monthYear,
    },
    attendance: {
      totalDays: monthDates.length,
      presentDays,
      absentDays: monthDates.length - presentDays,
      attendancePercentage: (presentDays / monthDates.length) * 100,
    },
    earnings: {
      hourlyRate,
      standardHours,
      regularHours: totalRegularHours,
      regularEarnings,
      overtimeHours: totalOvertimeHours,
      overtimeEarnings,
      totalEarnings,
    },
    adjustments: {
      totalCredits,
      totalDebits,
      creditTransactions,
      debitTransactions,
    },
    netSalary,
    dailyRecords,
  };
};
