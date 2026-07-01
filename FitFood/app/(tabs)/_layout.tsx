import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';  // ✅ Import this
import { colors } from '../../constants/Colors';
import React, { ComponentProps } from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: ComponentProps<typeof MaterialIcons>['name'] = 'home';
          if (route.name === 'home') iconName = 'home';
          else if (route.name === 'scan') iconName = 'camera-alt';
          else if (route.name === 'history') iconName = 'history';
          else if (route.name === 'profile') iconName = 'person';
          
          // ✅ Use MaterialIcons component
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 5 },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}