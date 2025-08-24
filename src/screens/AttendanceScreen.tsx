import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Button, Text, Surface, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Save, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react-native';
import { useEmployeeStore } from '../store/employeeStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { AttendanceToggle } from '../components/AttendanceToggle';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDisplayDate } from '../utils/dateUtils';
import { Employee } from '../types';

export const AttendanceScreen: React.FC = () => {
  const { employees, loadEmployees } = useEmployeeStore();
  const {
    currentDate,
    attendanceRecords,
    isLoading,
    loadAttendanceByDate,
    markAttendance,
    saveAttendance,
    setCurrentDate,
  } = useAttendanceStore();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadEmployees(true);
    loadAttendanceByDate(currentDate);
  }, [currentDate]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    
    const newDate = date.toISOString().split('T')[0];
    setCurrentDate(newDate);
  };

  const handleToggleAttendance = (employeeId: string, isPresent: boolean) => {
    markAttendance(employeeId, isPresent ? 'present' : 'absent');
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      await saveAttendance();
      Alert.alert('Success', 'Attendance saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAllPresent = () => {
    employees.forEach(employee => {
      markAttendance(employee.id, 'present');
    });
  };

  const handleMarkAllAbsent = () => {
    employees.forEach(employee => {
      markAttendance(employee.id, 'absent');
    });
  };

  const renderEmployee = ({ item }: { item: Employee }) => {
    const isPresent = attendanceRecords[item.id] === 'present';
    
    return (
      <AttendanceToggle
        employee={item}
        isPresent={isPresent}
        onToggle={handleToggleAttendance}
      />
    );
  };

  const presentCount = employees.filter(emp => attendanceRecords[emp.id] === 'present').length;
  const absentCount = employees.filter(emp => attendanceRecords[emp.id] === 'absent').length;
  const totalCount = employees.length;
  const notMarkedCount = employees.filter(emp => !attendanceRecords[emp.id]).length;

  if (isLoading && employees.length === 0) {
    return <LoadingSpinner message="Loading attendance data..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
       
        <Text style={styles.title}>Attendance</Text>
      
        
        <Surface style={styles.dateCard} elevation={0}>
          <View style={styles.dateSelector}>
            <IconButton
              icon={() => <ChevronLeft size={24} color="#F59E0B" />}
              onPress={() => handleDateChange('prev')}
            />
            
            <View style={styles.dateInfo}>
              <Calendar size={20} color="#F59E0B" />
              <Text style={styles.dateText}>
                {formatDisplayDate(currentDate)}
              </Text>
            </View>
            
            <IconButton
              icon={() => <ChevronRight size={24} color="#F59E0B" />}
              onPress={() => handleDateChange('next')}
            />
          </View>
        </Surface>

        <Surface style={styles.statsCard} elevation={0}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Present</Text>
              <Text style={[styles.statValue, styles.presentText]}>
                {presentCount}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Absent</Text>
              <Text style={[styles.statValue, styles.absentText]}>
                {absentCount}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Not Marked</Text>
              <Text style={[styles.statValue, styles.pendingText]}>
                {notMarkedCount}
              </Text>
            </View>
          </View>
        </Surface>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleMarkAllPresent}
            style={styles.actionButton}
            textColor="#10b981"
          >
            Mark All Present
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleMarkAllAbsent}
            style={styles.actionButton}
            textColor="#ef4444"
          >
            Mark All Absent
          </Button>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSaveAttendance}
          loading={isSaving}
          disabled={isSaving}
          style={styles.saveButton}
          buttonColor="#1F2937"
          labelStyle={styles.saveButtonLabel}
          icon={() => <Save size={20} color="white" />}
        >
          {isSaving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 24,
  },
  dateCard: {
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  dateText: {
    marginLeft: 8,
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
  statsCard: {
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#6B7280',
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontWeight: '700',
    fontSize: 24,
  },
  presentText: {
    color: '#10b981',
  },
  absentText: {
    color: '#ef4444',
  },
  pendingText: {
    color: '#f59e0b',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  listContainer: {
    paddingBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FAFAF9',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});