import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserCheck, User, Mail, Building, Briefcase, Hash } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEmployeeStore } from '../store/employeeStore';
import { Employee } from '../types';

export const EditEmployeeScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { updateEmployee } = useEmployeeStore();
  
  const employee = (route.params as any)?.employee as Employee;

  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    department: employee?.department || '',
    position: employee?.position || '',
    employeeId: employee?.employeeId || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, department, position, employeeId } = formData;
    
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!department.trim()) {
      Alert.alert('Error', 'Department is required');
      return false;
    }
    
    if (!position.trim()) {
      Alert.alert('Error', 'Position is required');
      return false;
    }
    
    if (!employeeId.trim()) {
      Alert.alert('Error', 'Employee ID is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateEmployee(employee.id, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department.trim(),
        position: formData.position.trim(),
        employeeId: formData.employeeId.trim(),
      });
      
      Alert.alert('Success', 'Employee updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <UserCheck size={32} color="#F59E0B" />
              </View>
            </View>
            <Text style={styles.title}>Edit Employee</Text>
            <Text style={styles.subtitle}>Update team member</Text>
            <Text style={styles.description}>Modify the details below</Text>
          </View>

          <View style={styles.formContainer}>
            <Surface style={styles.formCard} elevation={0}>
              <TextInput
                label="Full Name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                mode="outlined"
                left={<TextInput.Icon icon={() => <User size={20} color="#F59E0B" />} />}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { primary: '#F59E0B', outline: '#E5E7EB' } }}
              />

              <TextInput
                label="Email Address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon={() => <Mail size={20} color="#F59E0B" />} />}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { primary: '#F59E0B', outline: '#E5E7EB' } }}
              />

              <TextInput
                label="Department"
                value={formData.department}
                onChangeText={(value) => handleInputChange('department', value)}
                mode="outlined"
                left={<TextInput.Icon icon={() => <Building size={20} color="#F59E0B" />} />}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { primary: '#F59E0B', outline: '#E5E7EB' } }}
              />

              <TextInput
                label="Position"
                value={formData.position}
                onChangeText={(value) => handleInputChange('position', value)}
                mode="outlined"
                left={<TextInput.Icon icon={() => <Briefcase size={20} color="#F59E0B" />} />}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { primary: '#F59E0B', outline: '#E5E7EB' } }}
              />

              <TextInput
                label="Employee ID"
                value={formData.employeeId}
                onChangeText={(value) => handleInputChange('employeeId', value)}
                mode="outlined"
                left={<TextInput.Icon icon={() => <Hash size={20} color="#F59E0B" />} />}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { primary: '#F59E0B', outline: '#E5E7EB' } }}
              />

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={styles.cancelButton}
                  textColor="#6B7280"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  buttonColor="#1F2937"
                  labelStyle={styles.submitButtonLabel}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update'}
                </Button>
              </View>
            </Surface>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1.5,
    paddingVertical: 8,
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});