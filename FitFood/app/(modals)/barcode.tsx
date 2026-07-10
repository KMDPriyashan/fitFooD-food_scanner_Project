import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { colors } from '../../constants/Colors';
import { 
  getProductByBarcode, 
  searchProducts, 
  BarcodeProduct,
} from '../services/barcodeService';
import BottomNav from '../../components/BottomNav';

const { width, height } = Dimensions.get('window');

const getFallbackProduct = (barcode: string): BarcodeProduct => ({
  name: 'Unknown Product',
  brand: 'Unknown Brand',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  ingredients: 'Not available',
  allergens: [],
  image: 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Product',
  additives: [],
  nutritionGrade: 'Unknown',
});

export default function BarcodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<BarcodeProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProduct, setShowProduct] = useState(false);
  const [searchResults, setSearchResults] = useState<BarcodeProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');

  useEffect(() => {
    requestPermission();
  }, []);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);
    setShowProduct(false);
    
    try {
      const productData = await getProductByBarcode(result.data);
      if (productData) {
        setProduct(productData);
        setShowProduct(true);
      } else {
        const fallbackProduct = getFallbackProduct(result.data);
        setProduct(fallbackProduct);
        setShowProduct(true);
        Alert.alert(
          'Product Not Found',
          'Could not find this product in the database. Showing limited information.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch product details. Please try again.');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Info', 'Please enter a product name or barcode');
      return;
    }

    setIsSearching(true);
    try {
      // First try as barcode
      const productData = await getProductByBarcode(searchQuery.trim());
      if (productData) {
        setProduct(productData);
        setShowProduct(true);
        setIsSearching(false);
        return;
      }

      // Then try as search query
      const results = await searchProducts(searchQuery.trim());
      if (results.length > 0) {
        setSearchResults(results);
        setProduct(results[0]);
        setShowProduct(true);
      } else {
        Alert.alert('Not Found', 'No products found. Try a different search term.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search products.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      handleManualSearch();
    }
  };

  const switchToCamera = () => {
    setScanMode('camera');
    setShowManualSearch(false);
    setScanned(false);
    setProduct(null);
    setShowProduct(false);
  };

  const switchToManual = () => {
    setScanMode('manual');
    setShowManualSearch(true);
    setScanned(false);
    setProduct(null);
    setShowProduct(false);
  };

  const getNutritionGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A': return '#4CAF50';
      case 'B': return '#8BC34A';
      case 'C': return '#FFC107';
      case 'D': return '#FF9800';
      case 'E': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getNutritionGradeLabel = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A': return 'Excellent 🟢';
      case 'B': return 'Good 🟡';
      case 'C': return 'Average 🟠';
      case 'D': return 'Poor 🔴';
      case 'E': return 'Bad ⚫';
      default: return 'Unknown';
    }
  };

  const renderProductDetails = () => {
    if (!product) return null;

    return (
      <ScrollView style={styles.productContainer} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image || 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Product' }} 
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        {/* Product Name */}
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.brand && (
            <Text style={styles.productBrand}>by {product.brand}</Text>
          )}
        </View>

        {/* Nutrition Grade */}
        <View style={[styles.gradeContainer, { backgroundColor: getNutritionGradeColor(product.nutritionGrade) + '15' }]}>
          <View style={[styles.gradeBadge, { backgroundColor: getNutritionGradeColor(product.nutritionGrade) }]}>
            <Text style={styles.gradeText}>{product.nutritionGrade || '?'}</Text>
          </View>
          <Text style={styles.gradeLabel}>{getNutritionGradeLabel(product.nutritionGrade)}</Text>
        </View>

        {/* Nutrition Facts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥗 Nutrition Facts</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.fiber}g</Text>
              <Text style={styles.nutritionLabel}>Fiber</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.sugar}g</Text>
              <Text style={styles.nutritionLabel}>Sugar</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.sodium}mg</Text>
              <Text style={styles.nutritionLabel}>Sodium</Text>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        {product.ingredients && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Ingredients</Text>
            <Text style={styles.ingredientsText}>{product.ingredients}</Text>
          </View>
        )}

        {/* Allergens */}
        {product.allergens && product.allergens.length > 0 && (
          <View style={[styles.section, styles.allergenSection]}>
            <Text style={styles.sectionTitle}>🚨 Allergens</Text>
            <View style={styles.allergenContainer}>
              {product.allergens.map((allergen, index) => (
                <View key={index} style={styles.allergenTag}>
                  <Text style={styles.allergenText}>{allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additives */}
        {product.additives && product.additives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧪 Additives</Text>
            <View style={styles.additiveContainer}>
              {product.additives.slice(0, 10).map((additive, index) => (
                <View key={index} style={styles.additiveTag}>
                  <Text style={styles.additiveText}>{additive}</Text>
                </View>
              ))}
              {product.additives.length > 10 && (
                <Text style={styles.moreText}>+{product.additives.length - 10} more</Text>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert('Saved!', 'Product saved to history')}>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save to History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.scanAgainButton} onPress={switchToCamera}>
            <Ionicons name="camera-outline" size={20} color={colors.primary} />
            <Text style={styles.scanAgainButtonText}>Scan Another</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderManualSearch = () => (
    <KeyboardAvoidingView
      style={styles.manualContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.manualHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.manualTitle}>Search Product</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.manualContent}>
       
        <Text style={styles.manualSubtitle}>Enter product name or barcode</Text>
        
        <View style={styles.manualInputContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} style={styles.manualInputIcon} />
          <TextInput
            style={styles.manualInput}
            placeholder="e.g., Milk, Bread, 1234567890123"
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.manualSearchBtn}
          onPress={handleManualSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.manualSearchBtnText}>Search</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchToCameraBtn} onPress={switchToCamera}>
          <Ionicons name="camera-outline" size={20} color={colors.primary} />
          <Text style={styles.switchToCameraText}>Switch to Camera Scan</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  if (!permission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.permissionText}>Loading camera...</Text>
      </SafeAreaView>
    );
  }

  if (showProduct) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => {
              setShowProduct(false);
              setProduct(null);
              setScanned(false);
              if (scanMode === 'camera') {
                switchToCamera();
              } else {
                switchToManual();
              }
            }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.resultTitle}>Product Details</Text>
            <View style={{ width: 40 }} />
          </View>
          {loading || isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Fetching product details...</Text>
            </View>
          ) : (
            renderProductDetails()
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (scanMode === 'manual' || showManualSearch) {
    return renderManualSearch();
  }

  // Camera Mode
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
          }}
        >
          <View style={styles.cameraOverlay}>
            {/* Header */}
            <View style={styles.cameraHeader}>
              <TouchableOpacity style={styles.cameraBackBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>Scan Barcode</Text>
              <TouchableOpacity style={styles.cameraSearchBtn} onPress={switchToManual}>
                <Ionicons name="search" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Frame */}
            <View style={styles.frameContainer}>
              <View style={styles.frame}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
                <View style={styles.scanLine} />
                <Text style={styles.frameText}>Position barcode here</Text>
              </View>
            </View>

            {/* Bottom */}
            <View style={styles.bottomContainer}>
              <Text style={styles.bottomText}>
                {scanned ? 'Barcode scanned! Fetching details...' : 'Align barcode within the frame'}
              </Text>
              <View style={styles.bottomButtons}>
                {scanned && !loading && (
                  <TouchableOpacity style={styles.scanAgainBtn} onPress={() => setScanned(false)}>
                    <Text style={styles.scanAgainText}>Scan Again</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.manualBtn} onPress={switchToManual}>
                  <Ionicons name="search" size={18} color="#FFFFFF" />
                  <Text style={styles.manualBtnText}>Enter Manually</Text>
                </TouchableOpacity>
              </View>
              {loading && (
                <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
              )}
            </View>
          </View>
        </CameraView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  permissionText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  cameraBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraSearchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 280,
    height: 200,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 16,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    width: '80%',
    height: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  frameText: {
    color: '#FFFFFF',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    position: 'absolute',
    bottom: -40,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bottomText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  bottomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanAgainBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  manualBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  loader: {
    marginTop: 12,
  },
  manualContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  manualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  manualContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualIconContainer: {
    marginBottom: 16,
  },
  manualSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
  },
  manualInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  manualInputIcon: {
    marginRight: 10,
  },
  manualInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  manualSearchBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
  },
  manualSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchToCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  switchToCameraText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  productContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 180,
  },
  productHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  productBrand: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  gradeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gradeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  nutritionLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  ingredientsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  allergenSection: {
    borderWidth: 1,
    borderColor: '#FF9800' + '40',
  },
  allergenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  allergenText: {
    color: '#FF9800',
    fontSize: 13,
    fontWeight: '500',
  },
  additiveContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  additiveTag: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  additiveText: {
    fontSize: 12,
    color: colors.textLight,
  },
  moreText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  actionContainer: {
    marginBottom: 12,
    gap: 10,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  scanAgainButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  backBtn: {
    padding: 4,
  },
});