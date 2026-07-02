import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { colors } from '../../constants/Colors';

// Tab Data
const TABS = [
  { name: 'Home', icon: '🏠', route: '/(tabs)/home' },
  { name: 'Scan', icon: '📸', route: '/(tabs)/scan' },
  { name: 'History', icon: '📋', route: '/(tabs)/history' },
  { name: 'Foods', icon: '🍽', route: '/(tabs)/SLfood' },
  { name: 'User', icon: '👤', route: '/(tabs)/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname === route;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                isActive(tab.route) && styles.tabLabelActive,
              ]}
            >
              {tab.name}
            </Text>
            {isActive(tab.route) && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
  },
  container: {
    flexDirection: 'row',
    height: 65,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIcon: {
    fontSize: 24,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});