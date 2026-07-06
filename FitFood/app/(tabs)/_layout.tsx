import { Tabs } from 'expo-router';
import { View } from 'react-native';
import React from 'react';
import BottomNav from '../../components/BottomNav';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        {/* Home Tab */}
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home'
          }}
        />

        {/* Scan Tab */}
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan'
          }}
        />

        {/* Sri Lankan Foods Tab - NEW */}
        <Tabs.Screen
          name="SLfood"
          options={{
            title: 'Foods'
          }}
        />

        {/* History Tab */}
        <Tabs.Screen
          name="history"
          options={{
            title: 'History'
          }}
        />

        {/* Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile'
          }}
        />
      </Tabs>

      {/* Custom Bottom Navigation */}
      <BottomNav />
    </View>
  );
}