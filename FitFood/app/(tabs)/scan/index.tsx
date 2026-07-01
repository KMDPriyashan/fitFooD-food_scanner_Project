import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../../constants/Colors';

export default function CameraScreen() {
  const [isScanning, setIsScanning] = useState(false);

  const handleCapture = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false);
      // Navigate to result with mock data
      router.push({
        pathname: '/(modals)/result',
        params: { 
          foodName: 'Chicken Salad',
          healthScore: '78',
          calories: '350',
          protein: '25',
          carbs: '30',
          fat: '12'
        }
      });
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📸 Scan Food</Text>
        <Text style={styles.subtitle}>Point camera at your food</Text>
      </View>

      <View style={styles.previewContainer}>
        <View style={styles.frame}>
          <Text style={styles.frameText}>Position food here</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.captureButton} 
        onPress={handleCapture}
        disabled={isScanning}
      >
        <View style={styles.captureInner} />
      </TouchableOpacity>

      {isScanning && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Analyzing food...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  header: { 
    backgroundColor: colors.primary, 
    padding: 20, 
    paddingTop: 40,
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  previewContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  frame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  frameText: { color: '#fff', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.white },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});