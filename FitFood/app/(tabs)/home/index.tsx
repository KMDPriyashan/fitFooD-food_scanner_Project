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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../constants/Colors';
import { useAuth } from '../../../src/context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  // Features data
  const features = [
    {
      id: 1,
      title: 'Food Database',
      subtitle: 'Explore 100+ local foods',
      icon: '🍽️',
      route: '/(tabs)/SLfood',
    },
    {
      id: 2,
      title: 'Expert Panel',
      subtitle: 'Connect with health experts',
      icon: '👨‍⚕️',
      route: '/(tabs)/expert',
    },
    {
      id: 3,
      title: 'Smart Recipes',
      subtitle: 'Personalized meal ideas',
      icon: '🥗',
      route: '/(modals)/recipes',
    },
    {
      id: 4,
      title: 'Food Marketplace',
      subtitle: 'Find healthy foods near you',
      icon: '🛒',
      route: '/(tabs)/marketplace',
    },
    {
      id: 5,
      title: 'Weekly Meal Planner',
      subtitle: 'Plan your weekly meals',
      icon: '📋',
      route: '/(tabs)/meal-planner',
    },
  ];

  const handleFeaturePress = (route: string) => {
    try {
      router.push(route as any);
    } catch {
      router.push('/(modals)/checkout');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Tomato Red Gradient */}
        <LinearGradient
          colors={['#E53935', '#C62828']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.appName}>FitFood</Text>
              <Text style={styles.slogan}>Scan • Eat • Get Fit</Text>
              <Text style={styles.greeting}>
                Hello, <Text style={styles.userNameText}>{userName}</Text> 👋
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F5F5F5']}
                style={styles.profileGradient}
              >
                <Ionicons name="person" size={24} color="#E53935" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Decorative Elements */}
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.decoCircle3} />
          <View style={styles.decoDot1} />
          <View style={styles.decoDot2} />
          <View style={styles.decoDot3} />
        </LinearGradient>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <LinearGradient
            colors={['#FFF5F5', '#FFE8E8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}
          >
            <View style={styles.welcomeHeader}>
              <View style={[styles.welcomeEmojiContainer, { backgroundColor: '#FFE8E8' }]}>
                <Text style={styles.welcomeEmoji}>🌟</Text>
              </View>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>Welcome to FitFood!</Text>
                <Text style={styles.welcomeSubtitle}>Your health journey starts here</Text>
              </View>
            </View>
            <Text style={styles.welcomeText}>
              Smart choices start now! Hydrate first to fire up your metabolism, then explore our features below.
            </Text>
          </LinearGradient>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Features</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>100+</Text>
            <Text style={styles.statLabel}>Food Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Support</Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Features</Text>
          <Text style={styles.sectionSubtitle}>5 powerful tools for a healthier you</Text>
        </View>

        {/* ✅ FIXED: 2-Column Grid Feature Cards with visible text */}
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity 
              key={feature.id}
              style={styles.featureGridCard}
              onPress={() => handleFeaturePress(feature.route)}
              activeOpacity={0.8}
            >
              <View style={styles.featureGridContent}>
                <View style={styles.featureGridIconContainer}>
                  <Text style={styles.featureGridEmoji}>{feature.icon}</Text>
                </View>
                <Text style={styles.featureGridTitle}>{feature.title}</Text>
                <Text style={styles.featureGridDesc}>{feature.subtitle}</Text>
                <View style={styles.featureGridArrow}>
                  <Ionicons name="chevron-forward" size={16} color="#E53935" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quote Section */}
        <View style={styles.quoteContainer}>
          <LinearGradient
            colors={['#FFE8E8', '#FFD4D4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quoteGradient}
          >
            <Text style={styles.quoteIcon}>💚</Text>
            <Text style={styles.quoteText}>
              "Your health is an investment, not an expense."
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ in Sri Lanka</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E53935',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Header
  header: {
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
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  slogan: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginTop: 2,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 14,
    fontWeight: '400',
  },
  userNameText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  profileGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Decorative Elements
  decoCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -120,
    right: -80,
  },
  decoCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -60,
    left: -60,
  },
  decoCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.03)',
    top: 40,
    right: 40,
  },
  decoDot1: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: 80,
    left: 60,
  },
  decoDot2: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    bottom: 30,
    right: 80,
  },
  decoDot3: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: 20,
    left: 120,
  },

  // Welcome Card
  welcomeCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  welcomeGradient: {
    padding: 18,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  welcomeEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeEmoji: {
    fontSize: 22,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  welcomeText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },

  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E53935',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F1F5F9',
  },

  // Features Section Header
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },

  // ✅ FIXED: 2-Column Grid Feature Cards with visible content
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  featureGridCard: {
    width: (width - 48) / 2,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    overflow: 'hidden',
  },
  featureGridContent: {
    padding: 16,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  featureGridIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureGridEmoji: {
    fontSize: 28,
  },
  featureGridTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B', // Dark color for visibility
    textAlign: 'center',
    marginBottom: 4,
  },
  featureGridDesc: {
    fontSize: 11,
    color: '#64748B', // Medium gray for readability
    textAlign: 'center',
    lineHeight: 15,
  },
  featureGridArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  // Quote Section
  quoteContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quoteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  quoteIcon: {
    fontSize: 24,
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    color: '#B71C1C',
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
});