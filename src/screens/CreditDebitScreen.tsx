import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Text, Button, TextInput, Surface, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useEmployeeStore } from '../store/employeeStore';
import { useTransactionStore } from '../store/transactionStore';
import { ArrowLeft, Calendar as CalendarIcon, TrendingUp, TrendingDown, User, Search, X } from 'lucide-react-native';
import { Employee } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CreditDebitScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { employees, loadEmployees } = useEmployeeStore();
  const { addTransaction } = useTransactionStore();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactionType, setTransactionType] = useState<'credit' | 'debit' | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEmployees(true);
  }, []);

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }
    const query = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.employeeId.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(false);
    setSearchQuery('');
  };

  const handleOpenEmployeeModal = () => {
    setShowEmployeeModal(true);
    setSearchQuery('');
  };

  const handleCloseEmployeeModal = () => {
    setShowEmployeeModal(false);
    setSearchQuery('');
  };

  const renderEmployeeItem = ({ item }: { item: Employee }) => (
    <TouchableOpacity
      style={styles.modalEmployeeItem}
      onPress={() => handleEmployeeSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.modalEmployeeIconContainer}>
        <User size={20} color="#F59E0B" />
      </View>
      <View style={styles.modalEmployeeInfo}>
        <Text style={styles.modalEmployeeName}>{item.name}</Text>
        <Text style={styles.modalEmployeeDetail}>
          {item.position} • ID: {item.employeeId}
        </Text>
        <Text style={styles.modalEmployeeEmail}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <User size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>
        {searchQuery ? 'No employees found' : 'No employees available'}
      </Text>
      {searchQuery && (
        <Text style={styles.emptySubtext}>Try a different search term</Text>
      )}
    </View>
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateForStorage = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }
    if (!transactionType) {
      Alert.alert('Error', 'Please select Credit or Debit');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);

      await addTransaction({
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        date: formatDateForStorage(selectedDate),
        type: transactionType,
        amount: parseFloat(amount),
        description: description.trim() || undefined,
      });

      Alert.alert(
        'Success',
        `${transactionType === 'credit' ? 'Credit' : 'Debit'} of ₹${amount} added successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedEmployee && transactionType && amount && parseFloat(amount) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credit/Debit</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Employee */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Select Employee</Text>
          </View>

          {selectedEmployee ? (
            <TouchableOpacity
              style={styles.selectedEmployeeCard}
              onPress={handleOpenEmployeeModal}
            >
              <View style={styles.employeeIconContainer}>
                <User size={24} color="#059669" />
              </View>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{selectedEmployee.name}</Text>
                <Text style={styles.employeeDetail}>{selectedEmployee.position}</Text>
                <Text style={styles.employeeDetail}>ID: {selectedEmployee.employeeId}</Text>
              </View>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          ) : (
            <Button
              mode="outlined"
              onPress={handleOpenEmployeeModal}
              style={styles.selectButton}
              icon={() => <User size={20} color="#374151" />}
            >
              Select Employee
            </Button>
          )}
        </Surface>

        {/* Step 2: Select Date */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <CalendarIcon size={20} color="#374151" />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </Surface>

        {/* Step 3: Select Transaction Type */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.sectionTitle}>Transaction Type</Text>
          </View>

          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'credit' && styles.typeButtonActive,
                transactionType === 'credit' && styles.creditActive,
              ]}
              onPress={() => setTransactionType('credit')}
            >
              <TrendingUp
                size={24}
                color={transactionType === 'credit' ? '#FFFFFF' : '#059669'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  transactionType === 'credit' && styles.typeButtonTextActive,
                ]}
              >
                Credit
              </Text>
              <Text
                style={[
                  styles.typeButtonSubtext,
                  transactionType === 'credit' && styles.typeButtonSubtextActive,
                ]}
              >
                Money In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'debit' && styles.typeButtonActive,
                transactionType === 'debit' && styles.debitActive,
              ]}
              onPress={() => setTransactionType('debit')}
            >
              <TrendingDown
                size={24}
                color={transactionType === 'debit' ? '#FFFFFF' : '#DC2626'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  transactionType === 'debit' && styles.typeButtonTextActive,
                ]}
              >
                Debit
              </Text>
              <Text
                style={[
                  styles.typeButtonSubtext,
                  transactionType === 'debit' && styles.typeButtonSubtextActive,
                ]}
              >
                Money Out
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Step 4: Enter Amount */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <Text style={styles.sectionTitle}>Enter Amount</Text>
          </View>

          <TextInput
            mode="outlined"
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
            left={<TextInput.Affix text="₹" />}
            placeholder="0.00"
            outlineColor="#E5E7EB"
            activeOutlineColor="#F59E0B"
          />

          <TextInput
            mode="outlined"
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.descriptionInput]}
            placeholder="Add a note..."
            outlineColor="#E5E7EB"
            activeOutlineColor="#F59E0B"
          />
        </Surface>

        {/* Summary */}
        {canSubmit && (
          <Surface style={styles.summarySection} elevation={0}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Employee:</Text>
              <Text style={styles.summaryValue}>{selectedEmployee?.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type:</Text>
              <Text
                style={[
                  styles.summaryValue,
                  transactionType === 'credit' ? styles.creditText : styles.debitText,
                ]}
              >
                {transactionType === 'credit' ? 'Credit' : 'Debit'}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>Amount:</Text>
              <Text style={styles.summaryValueTotal}>₹{amount}</Text>
            </View>
          </Surface>
        )}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            style={styles.submitButton}
            buttonColor="#F59E0B"
            labelStyle={styles.submitButtonLabel}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Transaction'}
          </Button>
        </View>
      </ScrollView>

      {/* Employee Selection Modal */}
      <Modal
        visible={showEmployeeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseEmployeeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Employee</Text>
            <TouchableOpacity
              onPress={handleCloseEmployeeModal}
              style={styles.modalCloseButton}
            >
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, ID, position, or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Employee Count */}
          <View style={styles.countContainer}>
            <Text style={styles.countText}>
              {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
              {searchQuery && ` found`}
            </Text>
          </View>

          {/* Employee List */}
          <FlatList
            data={filteredEmployees}
            renderItem={renderEmployeeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={renderEmptyList}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews={true}
            getItemLayout={(data, index) => ({
              length: 88,
              offset: 88 * index,
              index,
            })}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  selectButton: {
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1.5,
  },
  selectedEmployeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#059669',
  },
  employeeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  employeeDetail: {
    fontSize: 13,
    color: '#6B7280',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalEmployeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAF9',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalEmployeeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalEmployeeInfo: {
    flex: 1,
  },
  modalEmployeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalEmployeeDetail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  modalEmployeeEmail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: 'transparent',
  },
  creditActive: {
    backgroundColor: '#059669',
  },
  debitActive: {
    backgroundColor: '#DC2626',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  typeButtonSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  typeButtonSubtextActive: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  descriptionInput: {
    minHeight: 80,
  },
  summarySection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryRowTotal: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#F59E0B',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryValueTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F59E0B',
  },
  creditText: {
    color: '#059669',
  },
  debitText: {
    color: '#DC2626',
  },
  buttonContainer: {
    paddingBottom: 32,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
