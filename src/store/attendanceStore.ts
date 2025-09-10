import { create } from 'zustand';
import { AttendanceState, AttendanceRecord, MonthlyAttendance, Employee } from '../types';
import { attendanceService, employeeService } from '../services/firebase';

interface AttendanceStore extends AttendanceState {
  loadTodayAttendance: () => Promise<void>;
  loadAttendanceByDate: (date: string) => Promise<void>;
  markAttendance: (employeeId: string, status: 'present' | 'absent' | { status: 'present' | 'absent'; overtimeHours?: number }) => void;
  saveAttendance: () => Promise<void>;
  loadMonthlyAttendance: (year: number, month: number) => Promise<void>;
  setCurrentDate: (date: string) => void;
  resetAttendance: () => void;
  generateMonthlyReport: (employees: Employee[], monthlyData: { [date: string]: AttendanceRecord }, year?: number, month?: number) => MonthlyAttendance[];
}

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  currentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  attendanceRecords: {},
  isLoading: false,
  monthlyData: [],

  loadTodayAttendance: async () => {
    const today = new Date().toISOString().split('T')[0];
    await get().loadAttendanceByDate(today);
  },

  loadAttendanceByDate: async (date: string) => {
    try {
      set({ isLoading: true, currentDate: date });
      const records = await attendanceService.getAttendanceByDate(date);
      set({ attendanceRecords: records, isLoading: false });
    } catch (error) {
      console.error('Error loading attendance:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  markAttendance: (employeeId: string, status: 'present' | 'absent' | { status: 'present' | 'absent'; overtimeHours?: number }) => {
    set(state => ({
      attendanceRecords: {
        ...state.attendanceRecords,
        [employeeId]: status,
      },
    }));
  },

  saveAttendance: async () => {
    try {
      const { currentDate, attendanceRecords } = get();
      set({ isLoading: true });
      
      await attendanceService.markAttendance(currentDate, attendanceRecords);
      
      // Refresh today's attendance to update dashboard
      await get().loadTodayAttendance();
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Error saving attendance:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  loadMonthlyAttendance: async (year: number, month: number) => {
    try {
      set({ isLoading: true });
      
      // Get monthly attendance data
      const monthlyAttendanceData = await attendanceService.getMonthlyAttendance(year, month);
      
      // Get all employees
      const employees = await employeeService.getAllEmployees();
      
      // Generate monthly report
      const monthlyReport = get().generateMonthlyReport(employees, monthlyAttendanceData, year, month);
      
      set({ monthlyData: monthlyReport, isLoading: false });
    } catch (error) {
      console.error('Error loading monthly attendance:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  setCurrentDate: (date: string) => {
    set({ currentDate: date });
  },

  resetAttendance: () => {
    set({
      attendanceRecords: {},
      monthlyData: [],
      isLoading: false,
    });
  },

  generateMonthlyReport: (employees: Employee[], monthlyData: { [date: string]: AttendanceRecord }, year?: number, month?: number) => {
    const report: MonthlyAttendance[] = [];
    const { getCurrentMonth, getMonthDates } = require('../utils/dateUtils');
    const targetMonth = year && month ? { year, month } : getCurrentMonth();
    const allDatesInMonth = getMonthDates(targetMonth.year, targetMonth.month);
    
    employees.forEach(employee => {
      let presentDays = 0;
      let totalOvertimeHours = 0;
      let totalRegularHours = 0;
      const dailyRecords: { [date: string]: 'present' | 'absent' } = {};
      
      // Check all days in the month
      allDatesInMonth.forEach(date => {
        const dayRecord = monthlyData[date];
        let status: 'present' | 'absent' = 'absent';
        
        if (dayRecord && dayRecord[employee.id]) {
          const empRecord = dayRecord[employee.id];
          if (typeof empRecord === 'string') {
            status = empRecord;
          } else if (typeof empRecord === 'object') {
            status = empRecord.status;
            if (status === 'present') {
              totalOvertimeHours += empRecord.overtimeHours || 0;
              totalRegularHours += employee.standardHours || 8;
            }
          }
        }
        
        dailyRecords[date] = status;
        
        if (status === 'present') {
          presentDays++;
          if (typeof dayRecord?.[employee.id] === 'string') {
            totalRegularHours += employee.standardHours || 8;
          }
        }
      });
      
      const totalDays = allDatesInMonth.length;
      const absentDays = totalDays - presentDays;
      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      report.push({
        employeeId: employee.id,
        employeeName: employee.name,
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
        dailyRecords,
        totalOvertimeHours,
        totalRegularHours,
      });
    });
    
    return report.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  },
}));