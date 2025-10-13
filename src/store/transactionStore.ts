import { create } from 'zustand';
import { Transaction, TransactionState } from '../types';
import { transactionService } from '../services/firebase';

interface TransactionStore extends TransactionState {
  loadTransactions: (employeeId?: string, startDate?: string, endDate?: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getEmployeeBalance: (employeeId: string) => Promise<number>;
  resetTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  isLoading: false,

  loadTransactions: async (employeeId?: string, startDate?: string, endDate?: string) => {
    try {
      set({ isLoading: true });

      let transactions: Transaction[];
      if (employeeId) {
        transactions = await transactionService.getEmployeeTransactions(employeeId, startDate, endDate);
      } else if (startDate && endDate) {
        transactions = await transactionService.getTransactionsByDateRange(startDate, endDate);
      } else {
        transactions = [];
      }

      set({ transactions, isLoading: false });
    } catch (error) {
      console.error('Error loading transactions:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  addTransaction: async (transaction) => {
    try {
      await transactionService.addTransaction(transaction);
      // Reload transactions for this employee
      await get().loadTransactions(transaction.employeeId);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  updateTransaction: async (id, transaction) => {
    try {
      await transactionService.updateTransaction(id, transaction);
      
      // Update the transaction in local state
      set(state => ({
        transactions: state.transactions.map(t =>
          t.id === id ? { ...t, ...transaction, updatedAt: new Date() } : t
        ),
      }));
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      await transactionService.deleteTransaction(id);
      
      // Remove the transaction from local state
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  getEmployeeBalance: async (employeeId: string) => {
    try {
      return await transactionService.getEmployeeBalance(employeeId);
    } catch (error) {
      console.error('Error getting employee balance:', error);
      throw error;
    }
  },

  resetTransactions: () => {
    set({
      transactions: [],
      isLoading: false,
    });
  },
}));
