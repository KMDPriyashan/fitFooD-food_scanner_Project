import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('🎉 Success', 'Account created! Please login.');
      router.push('/(auth)/login');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Section with Gradient */}
        <View style={styles.topSection}>
          <View style={styles.gradientBg}>
            <View style={styles.gradientOverlay1} />
            <View style={styles.gradientOverlay2} />
          </View>

          {/* Decorative Shapes */}
          <View style={styles.shape1} />
          <View style={styles.shape2} />
          <View style={styles.shape3} />

          <View style={styles.headerContent}>
            
            <Text style={styles.welcomeText}>Join FitFood</Text>
            <Text style={styles.subText}>Scan • Eat • Get Fit</Text>
            <View style={styles.badgeContainer}>
            </View>
          </View>
        </View>

        {/* Bottom Section - Form */}
        <View style={styles.bottomSection}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>Fill in your details to get started</Text>

            {/* Name Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🟥' : '✅'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Sign Up */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}> Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Top Section - Gradient Header
  topSection: {
    height: 280,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 235, 59, 0.15)',
  },
  gradientOverlay2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  shape1: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 235, 59, 0.1)',
  },
  shape2: {
    position: 'absolute',
    bottom: 30,
    right: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  shape3: {
    position: 'absolute',
    top: 150,
    left: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 235, 59, 0.08)',
  },

  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconText: {
    fontSize: 40,
  },
  welcomeText: {
    fontSize: 45,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  badgeContainer: {
    marginTop: 12,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Bottom Section - Form
  bottomSection: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,

  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  inputWrapper: {
    marginBottom: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    paddingHorizontal: 16,
    height: 54,
    marginTop: 8,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  eyeIcon: {
    fontSize: 18,
    opacity: 1,
    padding: 4,
  },

  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 4,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  strengthBar1: { backgroundColor: '#FF6B6B' },
  strengthBar2: { backgroundColor: '#FFD93D' },
  strengthBar3: { backgroundColor: '#6BCB77' },
  strengthText: {
    fontSize: 11,
    color: colors.textLight,
    marginLeft: 8,
  },

  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECF0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.textLight,
  },

  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    flex: 1,
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  socialText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: colors.textLight,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});