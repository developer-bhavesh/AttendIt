import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, User, Mail, Phone, Briefcase, Hash, DollarSign, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useEmployeeStore } from '../store/employeeStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AddEmployeeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addEmployee } = useEmployeeStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    position: '',
    employeeId: '',
    hourlyRate: '',
    standardHours: '8',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // No validation - allow all fields to be optional
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const employeeData: any = {
        name: formData.name.trim() || 'Unnamed Employee',
        email: formData.email.trim().toLowerCase() || 'no-email@example.com',
        mobile: formData.mobile.trim() || 'N/A',
        position: formData.position.trim() || 'N/A',
        employeeId: formData.employeeId.trim() || `EMP${Date.now()}`,
        salaryType: 'hourly',
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        standardHours: parseFloat(formData.standardHours) || 8,
      };

      await addEmployee(employeeData);
      
      Alert.alert('Success', 'Employee added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add employee');
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
                <UserPlus size={32} color="#F59E0B" />
              </View>
            </View>
            <Text style={styles.title}>Add Employee</Text>
            <Text style={styles.description}>Fill in the details below</Text>
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
                label="Mobile Number"
                value={formData.mobile}
                onChangeText={(value) => handleInputChange('mobile', value)}
                mode="outlined"
                keyboardType="phone-pad"
                left={<TextInput.Icon icon={() => <Phone size={20} color="#F59E0B" />} />}
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

              <View style={styles.salarySection}>
                <Text style={styles.sectionTitle}>Salary Information</Text>
                
                <TextInput
                  label="Hourly Rate"
                  value={formData.hourlyRate}
                  onChangeText={(value) => handleInputChange('hourlyRate', value)}
                  mode="outlined"
                  keyboardType="numeric"
                  left={<TextInput.Icon icon={() => <DollarSign size={20} color="#F59E0B" />} />}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  theme={{ colors: { primary: '#F59E0B', outline: '#E5E7EB' } }}
                />
                <TextInput
                  label="Standard Hours/Day"
                  value={formData.standardHours}
                  onChangeText={(value) => handleInputChange('standardHours', value)}
                  mode="outlined"
                  keyboardType="numeric"
                  left={<TextInput.Icon icon={() => <Clock size={20} color="#F59E0B" />} />}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  theme={{ colors: { primary: '#F59E0B', outline: '#E5E7EB' } }}
                />
              </View>

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
                  {isLoading ? 'Adding...' : 'Add'}
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
  salarySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  radioOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  radioTextSelected: {
    color: '#F59E0B',
    fontWeight: '600',
  },
});