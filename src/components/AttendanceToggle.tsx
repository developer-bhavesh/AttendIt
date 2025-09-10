import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, Switch, TextInput, Button } from 'react-native-paper';
import { CheckCircle, XCircle, Clock, DollarSign, Plus } from 'lucide-react-native';
import { Employee } from '../types';

interface AttendanceToggleProps {
  employee: Employee;
  isPresent: boolean;
  overtimeHours?: number;
  onToggle: (employeeId: string, isPresent: boolean, overtimeHours?: number) => void;
}

export const AttendanceToggle: React.FC<AttendanceToggleProps> = ({
  employee,
  isPresent,
  overtimeHours = 0,
  onToggle,
}) => {
  const [showOvertimeInput, setShowOvertimeInput] = useState(false);
  const [localOvertime, setLocalOvertime] = useState(overtimeHours.toString());

  const calculateEarnings = () => {
    if (!isPresent) return 0;
    
    const standardHours = employee.standardHours || 8;
    const regularEarnings = standardHours * (employee.hourlyRate || 0);
    const overtimeEarnings = (overtimeHours || 0) * (employee.hourlyRate || 0); // Standard rate for overtime
    
    return regularEarnings + overtimeEarnings;
  };

  const handleToggle = (value: boolean) => {
    onToggle(employee.id, value, parseFloat(localOvertime) || 0);
  };

  const handleOvertimeUpdate = () => {
    onToggle(employee.id, isPresent, parseFloat(localOvertime) || 0);
    setShowOvertimeInput(false);
  };
  return (
    <Surface style={[styles.card, isPresent ? styles.presentCard : styles.absentCard]} elevation={0}>
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
            <Text style={styles.name}>
              {employee.name}
            </Text>
            <Text style={styles.department}>{employee.mobile}</Text>
            <Text style={styles.employeeId}>ID: {employee.employeeId}</Text>
            {isPresent && (
              <View style={styles.earningsContainer}>
                <DollarSign size={14} color="#10b981" />
                <Text style={styles.earnings}>₹{calculateEarnings().toFixed(2)}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.toggleContainer}>
          <Text style={[styles.status, isPresent ? styles.presentText : styles.absentText]}>
            {isPresent ? 'Present' : 'Absent'}
          </Text>
          <Switch
            value={isPresent}
            onValueChange={handleToggle}
            thumbColor={isPresent ? '#10b981' : '#ef4444'}
            trackColor={{ false: '#fecaca', true: '#d1fae5' }}
          />
          {isPresent && (
            <TouchableOpacity 
              style={styles.overtimeButton}
              onPress={() => setShowOvertimeInput(!showOvertimeInput)}
            >
              <Plus size={16} color="#F59E0B" />
              <Text style={styles.overtimeButtonText}>OT</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {showOvertimeInput && isPresent && (
        <View style={styles.overtimeDetails}>
          <View style={styles.overtimeRow}>
            <TextInput
              label="Overtime Hours"
              value={localOvertime}
              onChangeText={setLocalOvertime}
              placeholder="0"
              keyboardType="numeric"
              style={styles.overtimeInput}
              mode="outlined"
              dense
            />
            <Button
              mode="contained"
              onPress={handleOvertimeUpdate}
              style={styles.updateButton}
              buttonColor="#F59E0B"
              compact
            >
              Set
            </Button>
          </View>
          {parseFloat(localOvertime) > 0 && (
            <Text style={styles.overtimeInfo}>
              Overtime: {localOvertime}h × ₹{employee.hourlyRate} = ₹{((parseFloat(localOvertime) || 0) * (employee.hourlyRate || 0)).toFixed(2)}
            </Text>
          )}
        </View>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  department: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 4,
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
  overtimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    gap: 4,
  },
  overtimeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  overtimeDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  overtimeInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  overtimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  overtimeInput: {
    flex: 1,
  },
  updateButton: {
    borderRadius: 8,
  },
});