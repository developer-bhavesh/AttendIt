import { Employee } from './index';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Employees: undefined;
  AddEmployee: undefined;
  EditEmployee: { employee: Employee };
  EmployeeReport: { employee: Employee };
  Attendance: undefined;
  Reports: undefined;
};

export {}; // Make this a module