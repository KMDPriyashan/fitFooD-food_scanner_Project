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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ✅ Tab Configuration with your actual features
const TABS = [
  { 
    name: 'Food DB', 
    icon: 'restaurant-outline', 
    activeIcon: 'restaurant', 
    route: '/(tabs)/SLfood' 
  },
  { 
    name: 'Expert', 
    icon: 'medkit-outline', 
    activeIcon: 'medkit', 
    route: '/(tabs)/expert' 
  },
  { 
    name: 'Recipes', 
    icon: 'book-outline', 
    activeIcon: 'book', 
    route: '/(modals)/recipes' 
  },
  { 
    name: 'Marketplace', 
    icon: 'storefront-outline', 
    activeIcon: 'storefront', 
    route: '/(tabs)/marketplace' 
  },
  { 
    name: 'Meal Planner', 
    icon: 'calendar-outline', 
    activeIcon: 'calendar', 
    route: '/(tabs)/meal-planner' 
  },
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
      {/* ✅ Tomato Red Background */}
      <LinearGradient
        colors={['#E53935', '#C62828']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        {/* ✅ Active White Background Indicator - Slides to active tab */}
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
              <Animated.View 
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: iconScale }] },
                  active && styles.iconContainerActive,
                ]}
              >
                <Ionicons
                  name={active ? tab.activeIcon : tab.icon as any}
                  size={22}
                  color={active ? '#E53935' : 'rgba(255,255,255,0.7)'}
                />
              </Animated.View>
              
              <Text
                style={[
                  styles.tabLabel,
                  active && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#E53935',
    marginBottom: 12
  },
  container: {
    flexDirection: 'row',
    height: 68,
    paddingBottom: 8,
    paddingTop: 4,
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
    zIndex: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeBackground: {
    position: 'absolute',
    top: 4,
    width: ACTIVE_INDICATOR_SIZE,
    height: ACTIVE_INDICATOR_SIZE,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: (TAB_WIDTH - ACTIVE_INDICATOR_SIZE) / 2,
  },
});