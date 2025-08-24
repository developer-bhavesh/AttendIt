import { MonthlyAttendance } from '../types';

export const generateCSVData = (monthlyData: MonthlyAttendance[], year: number, month: number): string => {
  const headers = ['Employee Name', 'Department', 'Total Days', 'Present Days', 'Absent Days', 'Attendance %'];
  
  // Add daily columns
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    headers.push(`Day ${day}`);
  }
  
  let csvContent = headers.join(',') + '\n';
  
  monthlyData.forEach(employee => {
    const row = [
      `"${employee.employeeName}"`,
      `"${employee.employeeName.split(' ')[0]} Dept"`, // Placeholder for department
      employee.totalDays.toString(),
      employee.presentDays.toString(),
      employee.absentDays.toString(),
      employee.attendancePercentage.toFixed(1) + '%',
    ];
    
    // Add daily attendance
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const status = employee.dailyRecords[date] || 'absent';
      row.push(status === 'present' ? 'Present' : 'Absent');
    }
    
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
};

export const downloadCSV = async (csvContent: string, filename: string) => {
  // For React Native, you would implement actual file operations like:
  
  /*
  import RNFS from 'react-native-fs';
  import Share from 'react-native-share';
  
  try {
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    await RNFS.writeFile(path, csvContent, 'utf8');
    
    const shareOptions = {
      title: 'Export Attendance Report',
      url: `file://${path}`,
      type: 'text/csv',
      filename: filename,
    };
    
    await Share.open(shareOptions);
  } catch (error) {
    console.error('Error sharing CSV:', error);
    throw error;
  }
  */
  
  // Placeholder implementation
  console.log('CSV Content prepared for download:', filename);
  console.log('Content preview:', csvContent.substring(0, 200) + '...');
};

export const generatePDFData = (monthlyData: MonthlyAttendance[], year: number, month: number) => {
  const averageAttendance = monthlyData.length > 0 
    ? monthlyData.reduce((sum, emp) => sum + emp.attendancePercentage, 0) / monthlyData.length 
    : 0;
    
  return {
    title: `Attendance Report - ${getMonthName(month)} ${year}`,
    subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    headers: ['Employee Name', 'Total Days', 'Present Days', 'Absent Days', 'Attendance Rate'],
    data: monthlyData.map(employee => [
      employee.employeeName,
      employee.totalDays.toString(),
      employee.presentDays.toString(),
      employee.absentDays.toString(),
      employee.attendancePercentage.toFixed(1) + '%',
    ]),
    summary: {
      totalEmployees: monthlyData.length,
      averageAttendance: averageAttendance.toFixed(1) + '%',
      highPerformers: monthlyData.filter(emp => emp.attendancePercentage >= 90).length,
      lowPerformers: monthlyData.filter(emp => emp.attendancePercentage < 70).length,
    },
    metadata: {
      reportType: 'Monthly Attendance Report',
      period: `${getMonthName(month)} ${year}`,
      generatedBy: 'AttendIt System',
      timestamp: new Date().toISOString(),
    },
  };
};

const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

export const generateExcelData = (monthlyData: MonthlyAttendance[], year: number, month: number) => {
  // For Excel export using react-native-xlsx or similar
  const workbook = {
    SheetNames: ['Attendance Report'],
    Sheets: {
      'Attendance Report': {
        '!ref': `A1:F${monthlyData.length + 1}`,
        A1: { v: 'Employee Name', t: 's' },
        B1: { v: 'Total Days', t: 's' },
        C1: { v: 'Present Days', t: 's' },
        D1: { v: 'Absent Days', t: 's' },
        E1: { v: 'Attendance %', t: 's' },
        ...monthlyData.reduce((acc, employee, index) => {
          const row = index + 2;
          return {
            ...acc,
            [`A${row}`]: { v: employee.employeeName, t: 's' },
            [`B${row}`]: { v: employee.totalDays, t: 'n' },
            [`C${row}`]: { v: employee.presentDays, t: 'n' },
            [`D${row}`]: { v: employee.absentDays, t: 'n' },
            [`E${row}`]: { v: employee.attendancePercentage, t: 'n' },
          };
        }, {}),
      },
    },
  };
  
  return workbook;
};