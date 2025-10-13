import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Modal, FlatList, TouchableOpacity, Pressable, Image, Linking, PermissionsAndroid } from 'react-native';
import { Surface, Text, Button, IconButton, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Calendar, User, Search, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useEmployeeStore } from '../store/employeeStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { useTransactionStore } from '../store/transactionStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getCurrentMonth, getMonthName, getMonthDates } from '../utils/dateUtils';
import { calculatePayslipData } from '../utils/payslipUtils';
import { generatePayslipHTML } from '../utils/payslipTemplate';
import { Employee } from '../types';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import DateTimePicker from '@react-native-community/datetimepicker';

// Import the logo
const logoIcon = require('../components/icon.png');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type DateRangeMode = 'month' | 'custom';

export const PayslipScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { employees, loadEmployees } = useEmployeeStore();
  const { monthlyData, loadMonthlyAttendance } = useAttendanceStore();
  const { transactions, loadTransactions } = useTransactionStore();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRangeMode, setDateRangeMode] = useState<DateRangeMode>('month');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dailyAttendanceData, setDailyAttendanceData] = useState<{[date: string]: any}>({});

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

  const generateDateRange = (start: Date, end: Date): string[] => {
    const dates: string[] = [];
    const currentDate = new Date(start);
    const endDate = new Date(end);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const loadPayslipData = async () => {
    if (!selectedEmployee) return;

    try {
      // Load monthly attendance - for custom range, load all months in the range
      if (dateRangeMode === 'month') {
        await loadMonthlyAttendance(selectedMonth.year, selectedMonth.month);
      } else {
        // For custom date range, load attendance for all months in the range
        const startMonth = customStartDate.getMonth() + 1;
        const startYear = customStartDate.getFullYear();
        const endMonth = customEndDate.getMonth() + 1;
        const endYear = customEndDate.getFullYear();
        
        // Load attendance for each month in the range
        let currentYear = startYear;
        let currentMonth = startMonth;
        
        while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
          await loadMonthlyAttendance(currentYear, currentMonth);
          currentMonth++;
          if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
          }
        }
      }

      // Load transactions
      const startDate = dateRangeMode === 'month'
        ? `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-01`
        : customStartDate.toISOString().split('T')[0];
      const endDate = dateRangeMode === 'month'
        ? `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-31`
        : customEndDate.toISOString().split('T')[0];

      await loadTransactions(selectedEmployee.id, startDate, endDate);

      // Load daily attendance data
      const monthDates = dateRangeMode === 'month'
        ? getMonthDates(selectedMonth.year, selectedMonth.month)
        : generateDateRange(customStartDate, customEndDate);
      const { attendanceService } = require('../services/firebase');
      const dailyData: { [date: string]: any } = {};

      console.log('Loading daily attendance for', monthDates.length, 'days');

      for (const date of monthDates) {
        try {
          const dayRecord = await attendanceService.getAttendanceByDate(date);
          if (dayRecord[selectedEmployee.id]) {
            dailyData[date] = dayRecord[selectedEmployee.id];
            console.log('Found attendance for', date, ':', dayRecord[selectedEmployee.id]);
          }
        } catch (error) {
          console.log('Error loading daily data for', date);
        }
      }
      
      console.log('Total daily records loaded:', Object.keys(dailyData).length);
      setDailyAttendanceData(dailyData);
    } catch (error) {
      console.error('Error loading payslip data:', error);
      Alert.alert('Error', 'Failed to load payslip data');
    }
  };

  useEffect(() => {
    if (selectedEmployee) {
      loadPayslipData();
    }
  }, [selectedEmployee, selectedMonth, dateRangeMode, customStartDate, customEndDate]);

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const androidVersion = Platform.Version;
      console.log('Android version:', androidVersion);

      // For Android 13+ (API 33+), we don't need WRITE_EXTERNAL_STORAGE
      if (androidVersion >= 33) {
        console.log('Android 13+: No storage permission needed');
        return true;
      }

      // For Android 11-12 (API 30-32)
      if (androidVersion >= 30) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to save PDF files to your Download folder',
            buttonPositive: 'Grant',
            buttonNegative: 'Deny',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage permission granted');
          return true;
        } else {
          console.log('Storage permission denied');
          Alert.alert(
            'Permission Required',
            'Storage permission is needed to save PDF files to your device. Please grant permission in app settings.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }

      // For Android 10 and below (API 29 and below)
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'This app needs access to save PDF files to your Download folder',
          buttonPositive: 'Grant',
          buttonNegative: 'Deny',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Storage permission granted');
        return true;
      } else {
        console.log('Storage permission denied');
        Alert.alert(
          'Permission Required',
          'Storage permission is needed to save PDF files.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }

    // Request storage permission
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return;
    }

    setIsGenerating(true);

    try {
      // Load fresh data for payslip generation
      const startDate = dateRangeMode === 'month'
        ? `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-01`
        : customStartDate.toISOString().split('T')[0];
      const endDate = dateRangeMode === 'month'
        ? `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-31`
        : customEndDate.toISOString().split('T')[0];

      // Generate date range based on mode
      const monthDates = dateRangeMode === 'month'
        ? getMonthDates(selectedMonth.year, selectedMonth.month)
        : generateDateRange(customStartDate, customEndDate);

      console.log('=== PAYSLIP GENERATION DEBUG ===');
      console.log('Date range:', startDate, 'to', endDate);
      console.log('Total dates:', monthDates.length);
      console.log('Employee hourly rate:', selectedEmployee.hourlyRate);
      console.log('Employee standard hours:', selectedEmployee.standardHours);

      // Load fresh daily attendance data
      const { attendanceService } = require('../services/firebase');
      const freshDailyData: { [date: string]: any } = {};

      console.log('Loading fresh daily attendance for PDF generation...');
      for (const date of monthDates) {
        try {
          const dayRecord = await attendanceService.getAttendanceByDate(date);
          if (dayRecord && dayRecord[selectedEmployee.id]) {
            freshDailyData[date] = dayRecord[selectedEmployee.id];
            console.log('Found attendance for', date, ':', dayRecord[selectedEmployee.id]);
          }
        } catch (error) {
          console.log('Error loading daily data for', date, error);
        }
      }

      console.log('Fresh daily records loaded:', Object.keys(freshDailyData).length);
      console.log('Sample fresh data:', Object.keys(freshDailyData).slice(0, 3).map(date => ({
        date,
        data: freshDailyData[date]
      })));

      // Load fresh transactions
      await loadTransactions(selectedEmployee.id, startDate, endDate);
      console.log('Transactions loaded:', transactions.length);

      // Load monthly attendance
      const employeeData = monthlyData.find(emp => emp.employeeId === selectedEmployee.id);
      console.log('Employee data from monthlyData:', employeeData);

      const payslipData = calculatePayslipData(
        selectedEmployee,
        employeeData,
        transactions,
        freshDailyData,
        monthDates,
        startDate,
        endDate
      );

      console.log('=== PAYSLIP CALCULATED ===');
      console.log('Present days:', payslipData.attendance.presentDays);
      console.log('Total days:', payslipData.attendance.totalDays);
      console.log('Regular hours:', payslipData.earnings.regularHours);
      console.log('Overtime hours:', payslipData.earnings.overtimeHours);
      console.log('Regular earnings:', payslipData.earnings.regularEarnings);
      console.log('Overtime earnings:', payslipData.earnings.overtimeEarnings);
      console.log('Total earnings:', payslipData.earnings.totalEarnings);
      console.log('Total credits:', payslipData.adjustments.totalCredits);
      console.log('Total debits:', payslipData.adjustments.totalDebits);
      console.log('Net salary:', payslipData.netSalary);
      console.log('Daily records count:', payslipData.dailyRecords.length);

      // Use text-based logo for PDF (no image loading needed)
      const logoBase64 = ''; // Empty string will trigger the AL logo in template
      console.log('Using AL text logo for PDF');

      const htmlContent = generatePayslipHTML(payslipData, logoBase64);

      const fileName = `Payslip_${selectedEmployee.name.replace(/\s+/g, '_')}_${payslipData.period.monthYear.replace(/\s+/g, '_')}`;
      
      // For Android, use Download folder as it's more accessible
      // Documents folder requires special permissions on Android 10+
      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: Platform.OS === 'android' ? 'Download' : 'Documents',
      };

      console.log('Saving PDF with options:', options);
      const file = await generatePDF(options);
      
      console.log('PDF Generation Result:', file);
      console.log('PDF initially saved to:', file.filePath);
      
      // Validate file path
      if (!file || !file.filePath) {
        console.error('Invalid file path:', file);
        setIsGenerating(false);
        Alert.alert('Error', 'Failed to generate PDF file. Please try again.');
        return;
      }

      // Copy file to public Download folder for Android
      let finalFilePath = file.filePath;
      if (Platform.OS === 'android') {
        try {
          const publicDownloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}.pdf`;
          console.log('Copying to public Download folder:', publicDownloadPath);
          
          // Copy the file to public Download folder
          await RNFS.copyFile(file.filePath, publicDownloadPath);
          finalFilePath = publicDownloadPath;
          
          console.log('File copied successfully to:', finalFilePath);
        } catch (copyError) {
          console.error('Error copying to Download folder:', copyError);
          // If copy fails, use original path
          console.log('Using original path:', file.filePath);
        }
      }
      
      setIsGenerating(false);
      console.log('Final PDF file path:', finalFilePath);

      // Ask user what to do with the PDF
      Alert.alert(
        'PDF Generated',
        `Payslip has been generated successfully!`,
        [
          {
            text: 'Share via WhatsApp',
            onPress: () => shareViaWhatsApp(finalFilePath),
          },
          {
            text: 'Share',
            onPress: () => shareFile(finalFilePath),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      setIsGenerating(false);
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  const shareFile = async (filePath: string) => {
    try {
      if (!filePath) {
        Alert.alert('Error', 'Invalid file path');
        return;
      }

      console.log('Attempting to share file:', filePath);
      console.log('File path type:', typeof filePath);

      // For Android, ensure proper file URI format
      const fileUri = Platform.OS === 'android' 
        ? (filePath.startsWith('file://') ? filePath : `file://${filePath}`)
        : filePath;

      console.log('Formatted file URI:', fileUri);

      try {
        const shareOptions = {
          title: 'Share Payslip PDF',
          url: fileUri,
          type: 'application/pdf',
        };
        
        console.log('Share options:', shareOptions);
        const result = await Share.open(shareOptions);
        console.log('Share result:', result);
      } catch (shareError: any) {
        console.error('Share error:', shareError);
        
        // If share fails, try to open the file directly
        if (Platform.OS === 'android') {
          try {
            console.log('Attempting to open file with Linking...');
            const canOpen = await Linking.canOpenURL(fileUri);
            console.log('Can open URL:', canOpen);
            
            if (canOpen) {
              await Linking.openURL(fileUri);
              Alert.alert('PDF Opened', 'The PDF has been opened. You can share it from your PDF viewer.');
            } else {
              Alert.alert('Error', 'Cannot open PDF file. Please check if you have a PDF viewer installed.');
            }
          } catch (linkError) {
            console.error('Linking error:', linkError);
            Alert.alert('Error', 'Failed to open or share the PDF file.');
          }
        } else {
          throw shareError;
        }
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing file:', error);
        Alert.alert('Error', `Failed to share file: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const shareViaWhatsApp = async (filePath: string) => {
    try {
      if (!filePath) {
        Alert.alert('Error', 'Invalid file path');
        return;
      }

      console.log('Attempting to share via WhatsApp:', filePath);

      // For Android, ensure proper file URI format
      const fileUri = Platform.OS === 'android' 
        ? (filePath.startsWith('file://') ? filePath : `file://${filePath}`)
        : filePath;

      console.log('WhatsApp file URI:', fileUri);

      try {
        const whatsappOptions = {
          title: 'Share Payslip via WhatsApp',
          url: fileUri,
          type: 'application/pdf',
          social: Share.Social.WHATSAPP as any,
        };
        
        console.log('WhatsApp share options:', whatsappOptions);
        const result = await Share.shareSingle(whatsappOptions);
        console.log('WhatsApp share result:', result);
      } catch (shareError: any) {
        console.error('WhatsApp share error:', shareError);
        
        if (shareError.message && shareError.message.includes('not installed')) {
          Alert.alert('WhatsApp Not Found', 'Please make sure WhatsApp is installed on your device.');
        } else if (shareError.message !== 'User did not share') {
          Alert.alert('Error', `Failed to share via WhatsApp: ${shareError.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing via WhatsApp:', error);
        Alert.alert('Error', `Failed to share via WhatsApp: ${error.message || 'Make sure WhatsApp is installed'}`);
      }
    }
  };

  const formatDateRange = () => {
    if (dateRangeMode === 'month') {
      return `${getMonthName(selectedMonth.month)} ${selectedMonth.year}`;
    } else {
      const start = customStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const end = customEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    }
  };

  if (isGenerating) {
    return <LoadingSpinner message="Generating payslip PDF..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
    

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.content}>
          {/* Employee Selection */}
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
                  <Text style={styles.employeeDetail}>{selectedEmployee.position} • ID: {selectedEmployee.employeeId}</Text>
                </View>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.selectEmployeeButton}
                onPress={handleOpenEmployeeModal}
              >
                <User size={20} color="#6B7280" />
                <Text style={styles.selectEmployeeText}>Tap to select employee</Text>
              </TouchableOpacity>
            )}
          </Surface>

          {/* Date Range Selection */}
          <Surface style={styles.section} elevation={0}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>Select Period</Text>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, dateRangeMode === 'month' && styles.tabActive]}
                onPress={() => setDateRangeMode('month')}
              >
                <Calendar size={16} color={dateRangeMode === 'month' ? '#FFFFFF' : '#6B7280'} />
                <Text style={[styles.tabText, dateRangeMode === 'month' && styles.tabTextActive]}>Month</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, dateRangeMode === 'custom' && styles.tabActive]}
                onPress={() => setDateRangeMode('custom')}
              >
                <Calendar size={16} color={dateRangeMode === 'custom' ? '#FFFFFF' : '#6B7280'} />
                <Text style={[styles.tabText, dateRangeMode === 'custom' && styles.tabTextActive]}>Custom Range</Text>
              </TouchableOpacity>
            </View>

            {dateRangeMode === 'month' ? (
              <View>
                <View style={styles.monthSelector}>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => {
                      const newMonth = selectedMonth.month === 1 ? 12 : selectedMonth.month - 1;
                      const newYear = selectedMonth.month === 1 ? selectedMonth.year - 1 : selectedMonth.year;
                      setSelectedMonth({ month: newMonth, year: newYear });
                    }}
                  >
                    <ChevronLeft size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setShowMonthPicker(true)}
                    style={styles.monthDisplay}
                  >
                    <Text style={styles.monthText}>{formatDateRange()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => {
                      const newMonth = selectedMonth.month === 12 ? 1 : selectedMonth.month + 1;
                      const newYear = selectedMonth.month === 12 ? selectedMonth.year + 1 : selectedMonth.year;
                      setSelectedMonth({ month: newMonth, year: newYear });
                    }}
                  >
                    <ChevronRight size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.customDateRange}>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>From</Text>
                  <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Calendar size={16} color="#059669" />
                    <Text style={styles.dateText}>
                      {customStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>To</Text>
                  <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Calendar size={16} color="#059669" />
                    <Text style={styles.dateText}>
                      {customEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Surface>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, !selectedEmployee && styles.generateButtonDisabled]}
            onPress={handleGeneratePDF}
            disabled={!selectedEmployee}
            activeOpacity={0.8}
          >
            <FileText size={22} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generate Payslip PDF</Text>
          </TouchableOpacity>


        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showMonthPicker && (
        <DateTimePicker
          value={new Date(selectedMonth.year, selectedMonth.month - 1, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowMonthPicker(Platform.OS === 'ios');
            if (selectedDate) {
              setSelectedMonth({
                month: selectedDate.getMonth() + 1,
                year: selectedDate.getFullYear(),
              });
            }
          }}
        />
      )}
      {showStartDatePicker && (
        <DateTimePicker
          value={customStartDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setCustomStartDate(selectedDate);
            }
          }}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={customEndDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setCustomEndDate(selectedDate);
            }
          }}
          minimumDate={customStartDate}
        />
      )}

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
    backgroundColor: '#F3F4F6',
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
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  // Employee Selection Styles
  selectedEmployeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  employeeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
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
    marginBottom: 4,
  },
  employeeDetail: {
    fontSize: 13,
    color: '#6B7280',
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  selectEmployeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    gap: 8,
  },
  selectEmployeeText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#F59E0B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  // Month Selector Styles
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // Date Selector Styles
  customDateRange: {
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    width: 60,
  },
  dateSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  selectButton: {
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1.5,
  },
  selectButtonContent: {
    flexDirection: 'row-reverse',
    paddingVertical: 8,
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: 300,
  },
  menuItemTitle: {
    fontSize: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  dateRangeModeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    borderRadius: 12,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  monthHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    borderRadius: 12,
    borderColor: '#E5E7EB',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 10,
  },
  generateButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  generateButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
  infoBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0891B2',
  },
  infoBoxText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  countContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalListContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalEmployeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalEmployeeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingVertical: 48,
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
});
