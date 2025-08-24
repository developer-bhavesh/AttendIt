import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Switch } from 'react-native-paper';
import { User, CheckCircle, XCircle } from 'lucide-react-native';
import { Employee } from '../types';

interface AttendanceToggleProps {
  employee: Employee;
  isPresent: boolean;
  onToggle: (employeeId: string, isPresent: boolean) => void;
}

export const AttendanceToggle: React.FC<AttendanceToggleProps> = ({
  employee,
  isPresent,
  onToggle,
}) => {
  return (
    <Card style={[styles.card, isPresent ? styles.presentCard : styles.absentCard]}>
      <Card.Content>
        <View style={styles.content}>
          <View style={styles.employeeInfo}>
            <View style={styles.iconContainer}>
              {isPresent ? (
                <CheckCircle size={24} color="#10b981" />
              ) : (
                <XCircle size={24} color="#ef4444" />
              )}
            </View>
            <View style={styles.details}>
              <Text variant="titleMedium" style={styles.name}>
                {employee.name}
              </Text>
              <Text style={styles.department}>{employee.department}</Text>
              <Text style={styles.employeeId}>ID: {employee.employeeId}</Text>
            </View>
          </View>
          
          <View style={styles.toggleContainer}>
            <Text style={[styles.status, isPresent ? styles.presentText : styles.absentText]}>
              {isPresent ? 'Present' : 'Absent'}
            </Text>
            <Switch
              value={isPresent}
              onValueChange={(value) => onToggle(employee.id, value)}
              thumbColor={isPresent ? '#10b981' : '#ef4444'}
              trackColor={{ false: '#fecaca', true: '#d1fae5' }}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
  },
  presentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  absentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  department: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 12,
    color: '#9ca3af',
  },
  toggleContainer: {
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  presentText: {
    color: '#10b981',
  },
  absentText: {
    color: '#ef4444',
  },
});