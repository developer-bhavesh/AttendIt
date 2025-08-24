import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, DataTable, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, User, UserCheck } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAttendanceStore } from '../store/attendanceStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getCurrentMonth, getMonthName, getPreviousMonth, getNextMonth, getMonthDates } from '../utils/dateUtils';
import { Employee } from '../types';

export const EmployeeReportScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const employee = (route.params as any)?.employee as Employee;
  const { monthlyData, isLoading, loadMonthlyAttendance } = useAttendanceStore();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  useEffect(() => {
    loadMonthlyAttendance(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

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
          <Text style={styles.subtitle}>{employee.department}</Text>
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
                Monthly Summary
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
          </View>
        )}

        <View>
          <Surface style={styles.calendarCard} elevation={0}>
            <Text style={styles.calendarTitle}>
              Daily Attendance
            </Text>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Date</DataTable.Title>
                <DataTable.Title>Day</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>

              {monthDates.map((date) => {
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = new Date(date).getDate();
                const status = employeeData?.dailyRecords[date] || 'absent';
                
                return (
                  <DataTable.Row key={date}>
                    <DataTable.Cell>{dayNumber}</DataTable.Cell>
                    <DataTable.Cell>{dayName}</DataTable.Cell>
                    <DataTable.Cell>
                      <Text style={[
                        styles.statusText,
                        status === 'present' ? styles.presentStatus : styles.absentStatus
                      ]}>
                        {status === 'present' ? 'Present' : 'Absent'}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
            </DataTable>
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
});