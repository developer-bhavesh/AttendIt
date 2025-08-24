import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';
import { LogOut } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { EmployeesScreen } from '../screens/EmployeesScreen';
import { AddEmployeeScreen } from '../screens/AddEmployeeScreen';
import { EditEmployeeScreen } from '../screens/EditEmployeeScreen';
import { EmployeeReportScreen } from '../screens/EmployeeReportScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { ReportsScreen } from '../screens/ReportsScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const headerRight = () => (
    <IconButton
      icon={() => <LogOut size={20} color="#F59E0B" />}
      onPress={handleSignOut}
    />
  );

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#F59E0B',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: true,
        }}
      >
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'AttendIt Dashboard',
            headerRight,
          }}
        />
        <Stack.Screen
          name="Employees"
          component={EmployeesScreen}
          options={{
            title: 'Employees',
            headerRight,
          }}
        />
        <Stack.Screen
          name="AddEmployee"
          component={AddEmployeeScreen}
          options={{
            title: 'Add Employee',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Attendance"
          component={AttendanceScreen}
          options={{
            title: 'Mark Attendance',
            headerRight,
          }}
        />
        <Stack.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            title: 'Attendance Reports',
            headerRight,
          }}
        />
        <Stack.Screen
          name="EditEmployee"
          component={EditEmployeeScreen}
          options={{
            title: 'Edit Employee',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="EmployeeReport"
          component={EmployeeReportScreen}
          options={{
            title: 'Employee Report',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};