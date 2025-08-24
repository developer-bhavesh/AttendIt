import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Employee, AttendanceRecord } from '../types';

// Initialize Firebase
try {
  if (!firebase.apps.length) {
    firebase.initializeApp();
  }
} catch (error) {
  console.log('Firebase already initialized');
}

// Collections
export const COLLECTIONS = {
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendance',
} as const;

// Auth Service
export const authService = {
  signIn: async (email: string, password: string) => {
    return await auth().signInWithEmailAndPassword(email, password);
  },

  signOut: async () => {
    return await auth().signOut();
  },

  getCurrentUser: () => {
    return auth().currentUser;
  },

  onAuthStateChanged: (callback: (user: any) => void) => {
    return auth().onAuthStateChanged(callback);
  },
};

// Employee Service
export const employeeService = {
  // Get employees with pagination
  getEmployees: async (limit: number = 20, lastDoc?: any, searchQuery?: string) => {
    let query = firestore()
      .collection(COLLECTIONS.EMPLOYEES)
      .orderBy('name');

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.limit(limit).get();
    
    let employees = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Employee[];

    // Client-side case-insensitive filtering
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      employees = employees.filter(emp => 
        emp.name.toLowerCase().includes(lowerQuery) ||
        emp.email.toLowerCase().includes(lowerQuery) ||
        emp.department.toLowerCase().includes(lowerQuery) ||
        emp.position.toLowerCase().includes(lowerQuery) ||
        emp.employeeId.toLowerCase().includes(lowerQuery)
      );
    }
    
    return {
      employees,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === limit,
    };
  },

  // Add employee
  addEmployee: async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    return await firestore()
      .collection(COLLECTIONS.EMPLOYEES)
      .add({
        ...employee,
        createdAt: now,
        updatedAt: now,
      });
  },

  // Update employee
  updateEmployee: async (id: string, employee: Partial<Employee>) => {
    return await firestore()
      .collection(COLLECTIONS.EMPLOYEES)
      .doc(id)
      .update({
        ...employee,
        updatedAt: new Date(),
      });
  },

  // Delete employee
  deleteEmployee: async (id: string) => {
    return await firestore()
      .collection(COLLECTIONS.EMPLOYEES)
      .doc(id)
      .delete();
  },

  // Get all employees (for attendance marking)
  getAllEmployees: async () => {
    const snapshot = await firestore()
      .collection(COLLECTIONS.EMPLOYEES)
      .orderBy('name')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Employee[];
  },
};

// Attendance Service
export const attendanceService = {
  // Get attendance for a specific date
  getAttendanceByDate: async (date: string) => {
    const doc = await firestore()
      .collection(COLLECTIONS.ATTENDANCE)
      .doc(date)
      .get();

    if (doc.exists) {
      const data = doc.data();
      delete data?.createdAt;
      delete data?.updatedAt;
      return data as AttendanceRecord;
    }
    return {};
  },

  // Mark attendance for a date (batch operation)
  markAttendance: async (date: string, records: AttendanceRecord) => {
    const batch = firestore().batch();
    const docRef = firestore().collection(COLLECTIONS.ATTENDANCE).doc(date);

    batch.set(docRef, {
      ...records,
      updatedAt: new Date(),
    }, { merge: true });

    return await batch.commit();
  },

  // Get monthly attendance data
  getMonthlyAttendance: async (year: number, month: number) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const snapshot = await firestore()
      .collection(COLLECTIONS.ATTENDANCE)
      .where(firestore.FieldPath.documentId(), '>=', startDate)
      .where(firestore.FieldPath.documentId(), '<=', endDate)
      .get();

    const monthlyData: { [date: string]: AttendanceRecord } = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      delete data?.updatedAt;
      monthlyData[doc.id] = data as AttendanceRecord;
    });

    return monthlyData;
  },

  // Get attendance report for specific employees and date range
  getAttendanceReport: async (startDate: string, endDate: string, employeeIds?: string[]) => {
    const snapshot = await firestore()
      .collection(COLLECTIONS.ATTENDANCE)
      .where(firestore.FieldPath.documentId(), '>=', startDate)
      .where(firestore.FieldPath.documentId(), '<=', endDate)
      .get();

    const reportData: { [date: string]: AttendanceRecord } = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      delete data?.updatedAt;
      
      if (employeeIds && employeeIds.length > 0) {
        const filteredData: AttendanceRecord = {};
        employeeIds.forEach(empId => {
          if (data[empId]) {
            filteredData[empId] = data[empId];
          }
        });
        reportData[doc.id] = filteredData;
      } else {
        reportData[doc.id] = data as AttendanceRecord;
      }
    });

    return reportData;
  },
};

// Initialize Firestore indexes (run once)
export const initializeFirestoreIndexes = () => {
  // These indexes should be created in Firebase Console:
  // 1. employees collection: name (ascending)
  // 2. attendance collection: __name__ (ascending) - for date-based queries
  console.log('Firestore indexes should be configured in Firebase Console');
};