import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../../constants/Colors';
import { useAuth } from '../../../src/context/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  // Features data
  const features = [
    {
      id: 1,
      title: 'Food Database',
      subtitle: '100+ local foods',
      icon: '🍽',
      color: '#e83939',
      bgColor: '#FFF0E8',
      route: '/(tabs)/SLfood',
    },
    {
      id: 2,
      title: 'Food Scanner',
      subtitle: 'Scan & analyze',
      icon: '📷',
      color: '#6C5CE7',
      bgColor: '#F0EDFF',
      route: '/(tabs)/scan',
    },
    {
      id: 3,
      title: 'Smart Recipes',
      subtitle: 'Track progress',
      icon: '🥪',
      color: '#00B894',
      bgColor: '#E8F8F5',
      route: '/(modals)/trends',
    },
    {
      id: 4,
      title: 'Gamification',
      subtitle: 'Badges & points',
      icon: '🏅',
      color: '#FDCB6E',
      bgColor: '#FFF8E8',
      route: '/(modals)/badges',
    },
    {
      id: 5,
      title: 'Sustainability',
      subtitle: 'Eco score',
      icon: '🌿',
      color: '#00B894',
      bgColor: '#E8F8F5',
      route: '/(modals)/result',
    },
    {
      id: 6,
      title: 'Community',
      subtitle: 'Team up & win',
      icon: '👥',
      color: '#E17055',
      bgColor: '#FFEEEB',
      route: '/(modals)/result',
    },
  ];

  const handleFeaturePress = (route: string) => {
    try {
      router.push(route as any);
    } catch {
      router.push('/(modals)/result');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary || '#4A3AFF'} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.appName}>FitFood</Text>
              <Text style={styles.slogan}>Scan • Eat • Get Fit</Text>
              <Text style={styles.greeting}>Hello, <Text style={styles.userNameText}>{userName}</Text> 👋</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.8}
            >
              <View style={styles.avatarPlaceholder} />
            </TouchableOpacity>
          </View>
          
          {/* Soft Geometric Background Circles */}
          <View style={styles.headerDecoration}>
            <View style={styles.decoCircle1} />
            <View style={styles.decoCircle2} />
          </View>
        </View>

        {/* Welcome / Daily Insights Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeEmoji}>🥗</Text>
            <Text style={styles.welcomeTitle}>Welcome to FitFood !</Text>
          </View>
          <Text style={styles.welcomeText}>
            Smart choices start now! 🌟 Hydrate first to fire up your metabolism, then tap below to log your lunch.
          </Text>
        </View>

        {/* Features Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Features</Text>
          <Text style={styles.sectionSubtitle}>6 powerful tools for a healthier you</Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity 
              key={feature.id}
              style={styles.featureCard}
              onPress={() => handleFeaturePress(feature.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.bgColor }]}>
                <Text style={styles.featureEmoji}>{feature.icon}</Text>
              </View>
              <Text style={styles.featureTitle} numberOfLines={1}>{feature.title}</Text>
              <Text style={styles.featureDesc} numberOfLines={1}>{feature.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Button */}
        <View style={styles.quickAction}>
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.85}
          >
            <Text style={styles.quickActionText}>Start Scanning Now</Text>
            <View style={styles.quickActionArrow} />
          </TouchableOpacity>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary || '#4A3AFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Much softer, modern light grey/blue background
  },

  // Header Modern Styling
  header: {
    backgroundColor: colors.primary || '#4A3AFF',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  slogan: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 2,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 16,
    fontWeight: '400',
  },
  userNameText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },

  // Premium Background Deco
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decoCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -50,
  },
  decoCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: -20,
  },

  // Welcome / Daily Tip Card (Enhanced)
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -20, // Negative margin to overlay onto the header beautifully
    padding: 20,
    borderRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  welcomeEmoji: {
    fontSize: 22,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text || '#1E293B',
  },
  welcomeText: {
    fontSize: 13,
    color: colors.textLight || '#64748B',
    lineHeight: 20,
  },

  // Features Section Layout
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text || '#1E293B',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textLight || '#64748B',
    marginTop: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  featureCard: {
    width: (width - 56) / 2, // Dynamic width calculation with clean spacing
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9', // Subtle borders for sleek definition
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 16, // Squircle shape instead of perfect circle for a modern iOS feel
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text || '#1E293B',
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textLight || '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },

  // CTA Quick Action Button
  quickAction: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary || '#4A3AFF',
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: colors.primary || '#4A3AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
    gap: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  quickActionArrow: {
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },

  // Footer Styling
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight || '#94A3B8',
    paddingVertical: 24,
    opacity: 0.6,
    letterSpacing: 0.3,
  },
});