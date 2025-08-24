import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { LoadingSpinner } from './src/components/LoadingSpinner';



// Modern warm theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1F2937',
    primaryContainer: '#FEF3C7',
    secondary: '#F59E0B',
    secondaryContainer: '#FEF3C7',
    surface: '#FFFFFF',
    surfaceVariant: '#FAFAF9',
    onSurface: '#111827',
    onSurfaceVariant: '#6B7280',
  },
};

function App(): React.JSX.Element {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <PaperProvider theme={theme}>
        <LoadingSpinner message="Loading, please wait..." />
      </PaperProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#ffffff"
        />
        <AppNavigator />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

export default App;
