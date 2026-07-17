import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../constants/Colors';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor={colors.primary} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
            
            {/* Meal Planner Screens */}
            <Stack.Screen name="(tabs)/meal-planner/index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)/meal-planner/create-meal" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)/meal-planner/shopping-list" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)/meal-planner/favorites" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)/meal-planner/progress" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)/meal-planner/history" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}