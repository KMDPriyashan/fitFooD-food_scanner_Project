import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🥗</Text>
        <Text style={styles.title}>Welcome to FitFood!</Text>
        <Text style={styles.description}>
          Your AI-powered nutrition assistant that helps you eat healthier, 
          track your meals, and achieve your fitness goals.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 0.7, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emoji: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 15 },
  description: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 },
  buttonContainer: { flex: 0.3, paddingHorizontal: 30, paddingBottom: 40, gap: 12 },
  loginButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  registerButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  registerButtonText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
});