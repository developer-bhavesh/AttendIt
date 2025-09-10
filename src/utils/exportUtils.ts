import { MonthlyAttendance } from '../types';

export const generateCSVData = (
  monthlyData: MonthlyAttendance[],
  year: number,
  month: number
): string => {
  const headers = [
    'Employee Name',
    'Employee ID',
    'Total Days',
    'Present Days',
    'Absent Days',
    'Attendance Percentage'
  ];

  const rows = monthlyData.map(employee => [
    employee.employeeName,
    employee.employeeId,
    employee.totalDays.toString(),
    employee.presentDays.toString(),
    employee.absentDays.toString(),
    `${employee.attendancePercentage.toFixed(1)}%`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvData: string, filename: string): void => {
  // For React Native, this would typically use a file system library
  // or share functionality. For now, we'll log the data.
  console.log('CSV Data:', csvData);
  console.log('Filename:', filename);
  // In a real implementation, you would use:
  // - react-native-fs for file operations
  // - react-native-share for sharing files
};

export const generatePDFData = (
  monthlyData: MonthlyAttendance[],
  year: number,
  month: number
): any => {
  // PDF generation would require a library like react-native-pdf-lib
  // For now, return structured data that could be used for PDF generation
  return {
    title: `Attendance Report - ${getMonthName(month)} ${year}`,
    data: monthlyData,
    summary: {
      totalEmployees: monthlyData.length,
      averageAttendance: monthlyData.length > 0 
        ? monthlyData.reduce((sum, emp) => sum + emp.attendancePercentage, 0) / monthlyData.length 
        : 0
    }
  };
};

const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};