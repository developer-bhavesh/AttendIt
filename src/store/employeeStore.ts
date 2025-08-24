import { create } from 'zustand';
import { Employee, EmployeeState } from '../types';
import { employeeService } from '../services/firebase';

interface EmployeeStore extends EmployeeState {
  loadEmployees: (refresh?: boolean) => Promise<void>;
  loadMoreEmployees: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  searchEmployees: (query: string) => Promise<void>;
  resetEmployees: () => void;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => {
  let lastDoc: any = null;

  return {
    employees: [],
    isLoading: false,
    searchQuery: '',
    currentPage: 1,
    hasMore: true,

    loadEmployees: async (refresh = false) => {
      const { isLoading, searchQuery } = get();
      if (isLoading) return;

      try {
        set({ isLoading: true });
        
        if (refresh) {
          lastDoc = null;
          set({ employees: [], currentPage: 1, hasMore: true });
        }

        const result = await employeeService.getEmployees(
          20,
          lastDoc,
          searchQuery || undefined
        );

        lastDoc = result.lastDoc;

        set(state => ({
          employees: refresh ? result.employees : [...state.employees, ...result.employees],
          hasMore: result.hasMore,
          currentPage: refresh ? 1 : state.currentPage + 1,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error loading employees:', error);
        set({ isLoading: false });
        throw error;
      }
    },

    loadMoreEmployees: async () => {
      const { hasMore, isLoading } = get();
      if (!hasMore || isLoading) return;

      await get().loadEmployees(false);
    },

    addEmployee: async (employee) => {
      try {
        await employeeService.addEmployee(employee);
        // Refresh the list to include the new employee
        await get().loadEmployees(true);
      } catch (error) {
        console.error('Error adding employee:', error);
        throw error;
      }
    },

    updateEmployee: async (id, employee) => {
      try {
        await employeeService.updateEmployee(id, employee);
        
        // Update the employee in the local state
        set(state => ({
          employees: state.employees.map(emp =>
            emp.id === id ? { ...emp, ...employee, updatedAt: new Date() } : emp
          ),
        }));
      } catch (error) {
        console.error('Error updating employee:', error);
        throw error;
      }
    },

    deleteEmployee: async (id) => {
      try {
        await employeeService.deleteEmployee(id);
        
        // Remove the employee from local state
        set(state => ({
          employees: state.employees.filter(emp => emp.id !== id),
        }));
      } catch (error) {
        console.error('Error deleting employee:', error);
        throw error;
      }
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    searchEmployees: async (query) => {
      set({ searchQuery: query });
      lastDoc = null;
      await get().loadEmployees(true);
    },

    resetEmployees: () => {
      lastDoc = null;
      set({
        employees: [],
        searchQuery: '',
        currentPage: 1,
        hasMore: true,
        isLoading: false,
      });
    },
  };
});