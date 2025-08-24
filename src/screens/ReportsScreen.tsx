import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Surface, Text, Button, DataTable, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Download, FileText, BarChart3 } from 'lucide-react-native';
import { useAttendanceStore } from '../store/attendanceStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getCurrentMonth, getMonthName, getPreviousMonth, getNextMonth } from '../utils/dateUtils';
import { generateCSVData, downloadCSV, generatePDFData } from '../utils/exportUtils';

export const ReportsScreen: React.FC = () => {
  const { monthlyData, isLoading, loadMonthlyAttendance } = useAttendanceStore();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  useEffect(() => {
    loadMonthlyAttendance(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth.year, currentMonth.month));
  };

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth.year, currentMonth.month));
  };

  const handleExportCSV = () => {
    try {
      const csvData = generateCSVData(monthlyData, currentMonth.year, currentMonth.month);
      const filename = `attendance_${currentMonth.year}_${currentMonth.month.toString().padStart(2, '0')}.csv`;
      downloadCSV(csvData, filename);
      Alert.alert('Export', 'CSV export initiated. Check your downloads folder.');
    } catch (error) {
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const handleExportPDF = () => {
    try {
      const pdfData = generatePDFData(monthlyData, currentMonth.year, currentMonth.month);
      console.log('PDF Data:', pdfData);
      Alert.alert('Export', 'PDF export feature will be implemented with a PDF library');
    } catch (error) {
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const totalEmployees = monthlyData.length;
  const averageAttendance = totalEmployees > 0 
    ? monthlyData.reduce((sum, emp) => sum + emp.attendancePercentage, 0) / totalEmployees 
    : 0;

  if (isLoading) {
    return <LoadingSpinner message="Loading monthly report..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <BarChart3 size={28} color="#F59E0B" />
            </View>
          </View>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>Monthly insights</Text>
          
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

          <Surface style={styles.summaryCard} elevation={0}>
            <Text style={styles.summaryTitle}>
              Monthly Summary
            </Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {totalEmployees}
                </Text>
                <Text style={styles.summaryLabel}>Total Employees</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {averageAttendance.toFixed(1)}%
                </Text>
                <Text style={styles.summaryLabel}>Average Attendance</Text>
              </View>
            </View>
          </Surface>
        </View>

        <View>
          <Surface style={styles.tableCard} elevation={0}>
            <Text style={styles.tableTitle}>
              Employee Attendance Report
            </Text>
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Employee</DataTable.Title>
                <DataTable.Title numeric>Present</DataTable.Title>
                <DataTable.Title numeric>Absent</DataTable.Title>
                <DataTable.Title numeric>%</DataTable.Title>
              </DataTable.Header>

              {monthlyData.map((employee) => (
                <DataTable.Row key={employee.employeeId}>
                  <DataTable.Cell>
                    <View>
                      <Text style={styles.employeeName}>{employee.employeeName}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.presentCount}>{employee.presentDays}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.absentCount}>{employee.absentDays}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text 
                      style={[
                        styles.percentage,
                        employee.attendancePercentage >= 80 ? styles.goodAttendance : styles.poorAttendance
                      ]}
                    >
                      {employee.attendancePercentage.toFixed(1)}%
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            {monthlyData.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No attendance data found for this month
                </Text>
              </View>
            )}
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
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 24,
  },
  monthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
    width: '100%',
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
    width: '100%',
  },
  summaryTitle: {
    color: '#111827',
    fontWeight: '600',
    marginBottom: 16,
    fontSize: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: '#F59E0B',
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 24,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1.5,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 24,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  tableTitle: {
    color: '#111827',
    fontWeight: '600',
    marginBottom: 16,
    fontSize: 18,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  employeeId: {
    fontSize: 12,
    color: '#6b7280',
  },
  presentCount: {
    color: '#10b981',
    fontWeight: '600',
  },
  absentCount: {
    color: '#ef4444',
    fontWeight: '600',
  },
  percentage: {
    fontWeight: '600',
  },
  goodAttendance: {
    color: '#10b981',
  },
  poorAttendance: {
    color: '#ef4444',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 16,
  },
});