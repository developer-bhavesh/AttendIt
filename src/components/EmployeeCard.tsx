import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, IconButton } from 'react-native-paper';
import { User, Mail, Building, Briefcase, Edit, Trash2, BarChart3 } from 'lucide-react-native';
import { Employee } from '../types';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onViewReport?: (employee: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onDelete,
  onViewReport,
}) => {
  return (
    <Surface style={styles.card} elevation={0}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={24} color="#F59E0B" />
          </View>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>
            {employee.name}
          </Text>
          <Text style={styles.employeeId}>ID: {employee.employeeId}</Text>
        </View>
        <View style={styles.actions}>
          {onViewReport && (
            <IconButton
              icon={() => <BarChart3 size={18} color="#10b981" />}
              size={20}
              onPress={() => onViewReport(employee)}
            />
          )}
          <IconButton
            icon={() => <Edit size={18} color="#F59E0B" />}
            size={20}
            onPress={() => onEdit(employee)}
          />
          <IconButton
            icon={() => <Trash2 size={18} color="#ef4444" />}
            size={20}
            onPress={() => onDelete(employee)}
          />
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Mail size={16} color="#6B7280" />
          <Text style={styles.detailText}>{employee.email}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Building size={16} color="#6B7280" />
          <Text style={styles.detailText}>{employee.department}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Briefcase size={16} color="#6B7280" />
          <Text style={styles.detailText}>{employee.position}</Text>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 12,
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
});