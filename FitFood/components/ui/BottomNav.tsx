import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

// Tab Configuration
const TABS = [
  { name: 'Home', icon: 'home', route: '/(tabs)/home' },
  { name: 'Scan', icon: 'camera-alt', route: '/(tabs)/scan' },
  { name: 'History', icon: 'history', route: '/(tabs)/history' },
  { name: 'Trend', icon: 'trending-up', route: '/(tabs)/trend' },
  { name: 'Profile', icon: 'person', route: '/(tabs)/profile' },
];

const TAB_WIDTH = width / TABS.length;
const ACTIVE_INDICATOR_SIZE = 50;

export default function BottomNav() {
  const pathname = usePathname();
  
  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Get active index
  const activeIndex = TABS.findIndex(tab => tab.route === pathname);

  // Animate when tab changes
  useEffect(() => {
    // Slide animation for active background
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // Scale animation for active icon
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIndex]);

  const handlePress = (route: string, index: number) => {
    router.push(route as any);
  };

  // Calculate active background position
  const indicatorPosition = slideAnim.interpolate({
    inputRange: [0, TABS.length - 1],
    outputRange: [0, (width / TABS.length) * (TABS.length - 1)],
  });

  const isActive = (route: string) => pathname === route;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Active Background Indicator - Slides to active tab */}
        <Animated.View 
          style={[
            styles.activeBackground,
            {
              transform: [{ translateX: indicatorPosition }],
            },
          ]}
        />

        {TABS.map((tab, index) => {
          const active = isActive(tab.route);
          const iconScale = active ? scaleAnim : new Animated.Value(1);

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => handlePress(tab.route, index)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <MaterialIcons
                  name={tab.icon as any}
                  size={26}
                  color={active ? '#FFFFFF' : '#666666'}
                />
              </Animated.View>
              
              <Text
                style={[
                  styles.tabLabel,
                  active && styles.tabLabelActive,
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    height: 68,
    backgroundColor: '#FFFFFF',
    paddingBottom: 6,
    position: 'relative',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#000000',
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeBackground: {
    position: 'absolute',
    top: 6,
    width: 60,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E53935', // Red color
    marginHorizontal: (TAB_WIDTH - 60) / 2,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
});