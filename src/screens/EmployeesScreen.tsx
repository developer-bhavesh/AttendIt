import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Searchbar, FAB, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useEmployeeStore } from '../store/employeeStore';
import { EmployeeCard } from '../components/EmployeeCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Employee } from '../types';

export const EmployeesScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    employees,
    isLoading,
    searchQuery,
    hasMore,
    loadEmployees,
    loadMoreEmployees,
    deleteEmployee,
    setSearchQuery,
    searchEmployees,
  } = useEmployeeStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEmployees(true);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchEmployees(query.trim().toLowerCase());
    } else {
      loadEmployees(true);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadEmployees(true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadMoreEmployees();
    }
  };

  const handleEdit = (employee: Employee) => {
    navigation.navigate('EditEmployee' as never, { employee } as never);
  };

  const handleViewReport = (employee: Employee) => {
    navigation.navigate('EmployeeReport' as never, { employee } as never);
  };

  const handleDelete = (employee: Employee) => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employee.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmployee(employee.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete employee');
            }
          },
        },
      ]
    );
  };

  const renderEmployee = ({ item }: { item: Employee }) => (
    <EmployeeCard
      employee={item}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewReport={handleViewReport}
    />
  );

  const renderFooter = () => {
    if (!isLoading || employees.length === 0) return null;
    return <LoadingSpinner message="Loading more employees..." size="small" />;
  };

  const renderEmpty = () => {
    if (isLoading && employees.length === 0) {
      return <LoadingSpinner message="Loading employees..." />;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleMedium" style={styles.emptyTitle}>
          {searchQuery ? 'No employees found' : 'No employees yet'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery 
            ? 'Try adjusting your search terms'
            : 'Add your first employee to get started'
          }
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Users size={28} color="#F59E0B" />
          </View>
        </View>
        <Text style={styles.title}>Employees</Text>
        <Text style={styles.subtitle}>Manage your team</Text>
        <Text style={styles.description}>{employees.length} total employees</Text>
        
        <Searchbar
          placeholder="Search employees..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          icon={() => <Search size={20} color="#6B7280" />}
          theme={{ colors: { primary: '#F59E0B', outline: '#E5E7EB' } }}
        />
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={(item) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={employees.length === 0 ? styles.emptyList : styles.listContent}
        />
      </View>

      <FAB
        icon={() => <Plus size={24} color="white" />}
        style={styles.fab}
        onPress={() => navigation.navigate('AddEmployee' as never)}
        label="Add Employee"
        color='#fff'
      />
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
    marginBottom: 24,
  },
  searchbar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
    width: '100%',
  },
  searchInput: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyList: {
    flex: 1,
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