import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slow rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    ).start();

    // Button scale
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 0.97,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const pulse = pulseAnim.interpolate({
    inputRange: [1, 1.08],
    outputRange: [1, 1.08],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background Layers */}
      <View style={styles.bgLayer1} />
      <View style={styles.bgLayer2} />
      <View style={styles.bgLayer3} />

      {/* Floating Elements */}
      <View style={styles.floatingElement1} />
      <View style={styles.floatingElement2} />
      <View style={styles.floatingElement3} />
      <View style={styles.floatingElement4} />
      <View style={styles.floatingElement5} />

      {/* Glowing Orbs */}
      <Animated.View style={[styles.glowOrb, styles.glowOrb1, { transform: [{ rotate }] }]} />
      <View style={[styles.glowOrb, styles.glowOrb2]} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >

        {/* Brand Name */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandPrefix}>Fit</Text>
          <Text style={styles.brandHighlight}>Food</Text>
        </View>

        <Text style={styles.tagline}>Scan • Eat • Get Fit</Text>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDiamond} />
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.subtitle}>
          Your AI-powered nutrition assistant for smarter, healthier eating
        </Text>
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPrimaryText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnSecondaryText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSkip}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.btnSkipText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E53935',
    overflow: 'hidden',
  },

  // Background Layers
  bgLayer1: {
    position: 'absolute',
    top: -300,
    right: -200,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(255, 235, 59, 0.04)',
  },
  bgLayer2: {
    position: 'absolute',
    bottom: -200,
    left: -150,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  bgLayer3: {
    position: 'absolute',
    top: 200,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },

  // Floating Elements
  floatingElement1: {
    position: 'absolute',
    top: 80,
    left: 30,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  floatingElement2: {
    position: 'absolute',
    top: 150,
    right: 40,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 235, 59, 0.06)',
  },
  floatingElement3: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  floatingElement4: {
    position: 'absolute',
    bottom: 120,
    right: 30,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 235, 59, 0.05)',
  },
  floatingElement5: {
    position: 'absolute',
    top: 300,
    left: 50,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },

  // Glowing Orbs
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
  },
  glowOrb1: {
    width: 200,
    height: 200,
    top: -80,
    right: -60,
    backgroundColor: '#FFEB3B',
  },
  glowOrb2: {
    width: 150,
    height: 150,
    bottom: -50,
    left: -60,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 0.68,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 10,
  },

  // Logo
  logoWrapper: {
    marginBottom: 20,
    shadowColor: '#FFEB3B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  logoRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoShape: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoLine1: {
    width: 28,
    height: 3,
    backgroundColor: '#FFEB3B',
    borderRadius: 2,
    position: 'absolute',
    top: 2,
    transform: [{ rotate: '-20deg' }],
  },
  logoLine2: {
    width: 28,
    height: 3,
    backgroundColor: '#FFC107',
    borderRadius: 2,
    position: 'absolute',
    top: 2,
    transform: [{ rotate: '20deg' }],
  },
  logoLine3: {
    width: 20,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    position: 'absolute',
    bottom: 2,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
    bottom: 10,
  },

  // Brand Name
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandPrefix: {
    fontSize: 96,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  brandHighlight: {
    fontSize: 46,
    fontWeight: '800',
    color: '#FFEB3B',
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 235, 59, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },

  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 8,
    textTransform: 'uppercase',
    marginTop: 6,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: 120,
    justifyContent: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dividerDiamond: {
    width: 6,
    height: 6,
    marginHorizontal: 10,
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'rgba(255, 235, 59, 0.3)',
  },

  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 15,
    letterSpacing: 0.3,
  },

  // Buttons
  buttonContainer: {
    flex: 0.32,
    paddingHorizontal: 30,
    paddingBottom: 35,
    justifyContent: 'flex-end',
    gap: 14,
  },

  btnPrimary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  btnPrimaryText: {
    color: '#E53935',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  btnSecondary: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  btnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.8,
  },

  btnSkip: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnSkipText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  version: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.15)',
    letterSpacing: 1.5,
  },
});