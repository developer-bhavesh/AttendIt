import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, DataTable, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, User, UserCheck, DollarSign, Clock, TrendingUp } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAttendanceStore } from '../store/attendanceStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getCurrentMonth, getMonthName, getPreviousMonth, getNextMonth, getMonthDates } from '../utils/dateUtils';
import { Employee } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = NativeStackScreenProps<RootStackParamList, 'EmployeeReport'>['route'];

export const EmployeeReportScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const employee = route.params?.employee;
  const { monthlyData, isLoading, loadMonthlyAttendance } = useAttendanceStore();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [dailyAttendanceData, setDailyAttendanceData] = useState<{[date: string]: any}>({});

  useEffect(() => {
    loadMonthlyAttendance(currentMonth.year, currentMonth.month);
    loadDailyAttendanceData();
  }, [currentMonth]);

  const loadDailyAttendanceData = async () => {
    const { attendanceService } = require('../services/firebase');
    const dailyData: { [date: string]: any } = {};
    
    for (const date of monthDates) {
      try {
        const dayRecord = await attendanceService.getAttendanceByDate(date);
        if (dayRecord[employee.id]) {
          dailyData[date] = dayRecord[employee.id];
        }
      } catch (error) {
        console.log('Error loading daily data for', date);
      }
    }
    setDailyAttendanceData(dailyData);
  };

  useEffect(() => {
    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadMonthlyAttendance(currentMonth.year, currentMonth.month);
    });
    return unsubscribe;
  }, [navigation, currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth.year, currentMonth.month));
  };

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth.year, currentMonth.month));
  };

  const employeeData = monthlyData.find(emp => emp.employeeId === employee.id);
  const monthDates = getMonthDates(currentMonth.year, currentMonth.month);



  // Calculate comprehensive salary data
  const calculateMonthlySalary = () => {
    const standardHours = employee.standardHours || 8;
    const hourlyRate = employee.hourlyRate || 0;
    const totalRegularHours = employeeData?.totalRegularHours || 0;
    const totalOvertimeHours = employeeData?.totalOvertimeHours || 0;
    
    const regularEarnings = totalRegularHours * hourlyRate;
    const overtimeEarnings = totalOvertimeHours * hourlyRate;
    const totalEarnings = regularEarnings + overtimeEarnings;
    
    return {
      baseSalary: regularEarnings,
      totalEarnings,
      regularHours: totalRegularHours,
      overtimeHours: totalOvertimeHours,
      overtimeEarnings,
      deductions: 0,
      workingDays: employeeData?.presentDays || 0,
      totalWorkingDays: monthDates.length,
      hourlyRate,
      standardHours,
    };
  };

  const salaryData = calculateMonthlySalary();

  if (isLoading) {
    return <LoadingSpinner message="Loading employee report..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <UserCheck size={28} color="#F59E0B" />
            </View>
          </View>
          <Text style={styles.title}>{employee.name}</Text>
          <Text style={styles.subtitle}>{employee.mobile}</Text>
          <Text style={styles.description}>{employee.position} • ID: {employee.employeeId}</Text>
        </View>

        <View style={styles.monthContainer}>
          <Surface style={styles.monthCard} elevation={0}>
            <View style={styles.monthSelector}>
              <IconButton
                icon={() => <ChevronLeft size={24} color="#F59E0B" />}
                onPress={handlePreviousMonth}
              />
              <Text style={styles.monthText}>
                {getMonthName(currentMonth.month)} {currentMonth.year}
              </Text>
              <IconButton
                icon={() => <ChevronRight size={24} color="#F59E0B" />}
                onPress={handleNextMonth}
              />
            </View>
          </Surface>
        </View>

        {employeeData && (
          <View>
            <Surface style={styles.summaryCard} elevation={0}>
              <Text style={styles.summaryTitle}>
                Attendance Summary
              </Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, styles.presentText]}>
                    {employeeData.presentDays}
                  </Text>
                  <Text style={styles.summaryLabel}>Present Days</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, styles.absentText]}>
                    {employeeData.absentDays}
                  </Text>
                  <Text style={styles.summaryLabel}>Absent Days</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, styles.percentageText]}>
                    {employeeData.attendancePercentage.toFixed(1)}%
                  </Text>
                  <Text style={styles.summaryLabel}>Attendance</Text>
                </View>
              </View>
            </Surface>

            <Surface style={styles.salaryCard} elevation={0}>
              <View style={styles.salaryHeader}>
                <DollarSign size={24} color="#10b981" />
                <Text style={styles.salaryTitle}>Salary Report</Text>
              </View>
              
              <View style={styles.salaryDetails}>
                <View style={styles.salaryRow}>
                  <Text style={styles.salaryLabel}>Salary Type:</Text>
                  <Text style={styles.salaryValue}>Hourly</Text>
                </View>
                
                <View style={styles.salaryRow}>
                  <Text style={styles.salaryLabel}>Hourly Rate:</Text>
                  <Text style={styles.salaryValue}>₹{salaryData.hourlyRate}/hr</Text>
                </View>
                <View style={styles.salaryRow}>
                  <Text style={styles.salaryLabel}>Standard Hours/Day:</Text>
                  <Text style={styles.salaryValue}>{salaryData.standardHours}h</Text>
                </View>
                <View style={styles.salaryRow}>
                  <Text style={styles.salaryLabel}>Total Hours:</Text>
                  <Text style={styles.salaryValue}>{salaryData.regularHours}h</Text>
                </View>
                <View style={styles.salaryRow}>
                  <Text style={styles.salaryLabel}>Regular Earnings:</Text>
                  <Text style={styles.salaryValue}>₹{salaryData.baseSalary.toFixed(2)}</Text>
                </View>
                {salaryData.overtimeHours > 0 && (
                  <>
                    <View style={styles.salaryRow}>
                      <Text style={styles.salaryLabel}>Overtime Hours:</Text>
                      <Text style={styles.salaryValue}>{salaryData.overtimeHours}h</Text>
                    </View>
                    <View style={styles.salaryRow}>
                      <Text style={styles.salaryLabel}>Overtime Earnings:</Text>
                      <Text style={styles.salaryValue}>₹{salaryData.overtimeEarnings.toFixed(2)}</Text>
                    </View>
                  </>
                )}
                
                <View style={styles.divider} />
                
                <View style={[styles.salaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Earnings:</Text>
                  <Text style={styles.totalValue}>₹{salaryData.totalEarnings.toFixed(2)}</Text>
                </View>
                
                <View style={[styles.salaryRow, styles.netRow]}>
                  <Text style={styles.netLabel}>Net Salary:</Text>
                  <Text style={styles.netValue}>
                    ₹{salaryData.totalEarnings.toFixed(2)}
                  </Text>
                </View>
              </View>
            </Surface>
          </View>
        )}

        <View>
          <Surface style={styles.calendarCard} elevation={0}>
            <Text style={styles.calendarTitle}>
              Daily Salary Report
            </Text>
            <DataTable style={styles.dataTable}>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title textStyle={styles.headerText}>Date</DataTable.Title>
                <DataTable.Title textStyle={styles.headerText}>Status</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.headerText}>Total Hours</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.headerText}>Earnings</DataTable.Title>
              </DataTable.Header>

              {monthDates.map((date) => {
                const dayNumber = new Date(date).getDate();
                const status = employeeData?.dailyRecords[date] || 'absent';
                const isPresent = status === 'present';
                
                // Get actual overtime from daily attendance data
                const dailyRecord = dailyAttendanceData[date];
                let overtimeHours = 0;
                
                if (isPresent && dailyRecord) {
                  if (typeof dailyRecord === 'object' && dailyRecord.overtimeHours) {
                    overtimeHours = dailyRecord.overtimeHours;
                  }
                }
                
                const regularHours = isPresent ? employee.standardHours : 0;
                const totalHours = regularHours + overtimeHours;
                const regularEarnings = regularHours * employee.hourlyRate;
                const overtimeEarnings = overtimeHours * employee.hourlyRate;
                const dailyEarnings = regularEarnings + overtimeEarnings;
                
                return (
                  <DataTable.Row key={date} style={styles.tableRow}>
                    <DataTable.Cell>
                      <Text style={styles.dateText}>{dayNumber}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text style={[
                        styles.statusText,
                        isPresent ? styles.presentStatus : styles.absentStatus
                      ]}>
                        {isPresent ? 'Present' : 'Absent'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <View style={styles.hoursBreakdown}>
                        <Text style={styles.totalHoursText}>{totalHours.toFixed(1)}h</Text>
                        {overtimeHours > 0 && (
                          <Text style={styles.overtimeText}>({regularHours}h + {overtimeHours.toFixed(1)}h OT)</Text>
                        )}
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <View style={styles.earningsBreakdown}>
                        <Text style={[
                          styles.earningsText,
                          isPresent ? styles.positiveEarnings : styles.zeroEarnings
                        ]}>
                          ₹{dailyEarnings.toFixed(2)}
                        </Text>
                        {overtimeHours > 0 && (
                          <Text style={styles.overtimeEarningsText}>
                            (₹{overtimeEarnings.toFixed(2)} OT)
                          </Text>
                        )}
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
            </DataTable>
            
            <View style={styles.dailySummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabel}>Total Working Days:</Text>
                <Text style={styles.summaryRowValue}>{employeeData?.presentDays || 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabel}>Total Hours Worked:</Text>
                <Text style={styles.summaryRowValue}>
                  {(salaryData.regularHours + salaryData.overtimeHours).toFixed(1)}h
                  {salaryData.overtimeHours > 0 && (
                    <Text style={styles.summaryBreakdown}>
                      {' '}({salaryData.regularHours}h + {salaryData.overtimeHours.toFixed(1)}h OT)
                    </Text>
                  )}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabel}>Average Daily Earnings:</Text>
                <Text style={styles.summaryRowValue}>
                  ₹{employeeData?.presentDays ? (salaryData.totalEarnings / employeeData.presentDays).toFixed(2) : '0.00'}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalSummaryRow]}>
                <Text style={styles.totalSummaryLabel}>Monthly Total:</Text>
                <Text style={styles.totalSummaryValue}>₹{salaryData.totalEarnings.toFixed(2)}</Text>
              </View>
            </View>
          </Surface>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'center',
  },
  monthContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  monthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 18,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  summaryTitle: {
    color: '#111827',
    fontWeight: '600',
    marginBottom: 16,
    fontSize: 18,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 24,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  presentText: {
    color: '#10b981',
  },
  absentText: {
    color: '#ef4444',
  },
  percentageText: {
    color: '#F59E0B',
  },
  salaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  salaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  salaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  salaryDetails: {
    gap: 12,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  salaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalRow: {
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '700',
  },
  deductionLabel: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  deductionValue: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  netRow: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  netLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  netValue: {
    fontSize: 18,
    color: '#059669',
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  calendarTitle: {
    color: '#111827',
    fontWeight: '600',
    marginBottom: 16,
    fontSize: 18,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
  },
  presentStatus: {
    color: '#10b981',
    backgroundColor: '#d1fae5',
  },
  absentStatus: {
    color: '#ef4444',
    backgroundColor: '#fecaca',
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  earningsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  positiveEarnings: {
    color: '#10b981',
  },
  zeroEarnings: {
    color: '#6B7280',
  },
  dailySummary: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryRowLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryRowValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  totalSummaryRow: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  totalSummaryLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  totalSummaryValue: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '700',
  },
  dataTable: {
    backgroundColor: '#FAFAF9',
    borderRadius: 12,
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  hoursBreakdown: {
    alignItems: 'flex-end',
  },
  totalHoursText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  overtimeText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '500',
    marginTop: 2,
  },
  earningsBreakdown: {
    alignItems: 'flex-end',
  },
  overtimeEarningsText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '500',
    marginTop: 2,
  },
  summaryBreakdown: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
});