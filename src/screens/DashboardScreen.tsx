import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, FAB, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Calendar, BarChart3, Clock, Plus, TrendingUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useEmployeeStore } from '../store/employeeStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { formatDisplayDate } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { employees, loadEmployees } = useEmployeeStore();
  const { loadTodayAttendance, attendanceRecords, currentDate } = useAttendanceStore();
  useEffect(() => {
    loadEmployees(true);
    loadTodayAttendance();
  }, []);

  const totalEmployees = employees.length;
  const presentToday = employees.filter(emp => attendanceRecords[emp.id] === 'present').length;
  const absentToday = employees.filter(emp => attendanceRecords[emp.id] === 'absent').length;
  const notMarkedToday = employees.filter(emp => !attendanceRecords[emp.id]).length;

  const stats = [
    {
      title: 'Total Employees',
      value: totalEmployees.toString(),
      icon: Users,
      color: '#059669',
      bgColor: '#ECFDF5',
      onPress: () => navigation.navigate('Employees' as never),
    },
    {
      title: 'Present Today',
      value: presentToday.toString(),
      icon: Clock,
      color: '#0891B2',
      bgColor: '#F0F9FF',
      onPress: () => navigation.navigate('Attendance' as never),
    },
    {
      title: 'Absent Today',
      value: absentToday.toString(),
      icon: Calendar,
      color: '#DC2626',
      bgColor: '#FEF2F2',
      onPress: () => navigation.navigate('Attendance' as never),
    },
    {
      title: 'Not Marked',
      value: notMarkedToday.toString(),
      icon: BarChart3,
      color: '#D97706',
      bgColor: '#FFFBEB',
      onPress: () => navigation.navigate('Attendance' as never),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Good morning</Text>
          <Text style={styles.description}>{formatDisplayDate(currentDate)}</Text>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity key={index} onPress={stat.onPress} activeOpacity={0.7}>
              <Surface style={styles.statCard} elevation={0}>
                <View style={styles.statContent}>
                  <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                    <stat.icon size={24} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <Surface style={styles.actionCard} elevation={0}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Attendance' as never)}
              style={styles.primaryAction}
              buttonColor="#1F2937"
              labelStyle={styles.primaryActionLabel}
              icon={() => <Calendar size={20} color="white" />}
            >
              Mark Today's Attendance
            </Button>
            
            <View style={styles.secondaryActions}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Reports' as never)}
                style={styles.secondaryButton}
                textColor="#374151"
                icon={() => <BarChart3 size={18} color="#374151" />}
              >
                Reports
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Employees' as never)}
                style={styles.secondaryButton}
                textColor="#374151"
                icon={() => <Users size={18} color="#374151" />}
              >
                Employees
              </Button>
            </View>
          </Surface>
        </View>
      </ScrollView>

      <FAB
        icon={() => <Plus size={24} color="white" />}
        style={styles.fab}
        onPress={() => navigation.navigate('AddEmployee' as never)}
        customSize={56}
      />
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
    paddingBottom: 32,
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
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
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
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  primaryAction: {
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 16,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryActionLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1.5,
  },
  fab: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 0,
    backgroundColor: '#F59E0B',
    borderRadius: 28,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});