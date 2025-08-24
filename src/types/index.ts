export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  [employeeId: string]: 'present' | 'absent';
}

export interface AttendanceDay {
  date: string; // YYYY-MM-DD format
  records: AttendanceRecord;
}

export interface MonthlyAttendance {
  employeeId: string;
  employeeName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
  dailyRecords: { [date: string]: 'present' | 'absent' };
}

export interface AuthState {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface EmployeeState {
  employees: Employee[];
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;
  hasMore: boolean;
}

export interface AttendanceState {
  currentDate: string;
  attendanceRecords: AttendanceRecord;
  isLoading: boolean;
  monthlyData: MonthlyAttendance[];
}