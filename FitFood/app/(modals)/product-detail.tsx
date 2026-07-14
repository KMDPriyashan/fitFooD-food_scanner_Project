// app/(modals)/product-detail.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  Share,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/Colors';
import { marketplaceService } from '../services/marketplaceService';
import { Product } from '../../types/marketplace.types';
import { SAMPLE_PRODUCTS } from '../../constants/marketplaceData';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 380;

// ✅ Category-based color mapping for fallback images
const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Vegetables': '#4CAF50',
    'Fruits': '#FF9800',
    'Grains': '#795548',
    'Dairy': '#2196F3',
    'Spices': '#9C27B0',
    'Meat': '#F44336',
    'Seafood': '#00BCD4',
    'Beverages': '#3F51B5',
    'Snacks': '#FF5722',
    'Default': '#4CAF50'
  };
  return colors[category] || colors['Default'];
};

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [imageError, setImageError] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (productId) {
      loadProduct();
    } else {
      router.back();
    }
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      let data = await marketplaceService.getProductById(productId);
      
      if (!data) {
        data = SAMPLE_PRODUCTS.find(p => p.id === productId) || null;
      }
      
      setProduct(data);
      setImageError(false); // Reset image error when new product loads
      
      if (data) {
        const cart = await marketplaceService.getCart();
        const existingItem = cart.find(item => item.id === data.id);
        setIsInCart(!!existingItem);
        if (existingItem) {
          setQuantity(existingItem.quantity);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      const cart = await marketplaceService.getCart();
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity = quantity;
      } else {
        cart.push({
          ...product,
          quantity: quantity,
        });
      }
      
      await marketplaceService.saveCart(cart);
      setIsInCart(true);
      
      Alert.alert(
        '🎉 Added to Cart',
        `${quantity} × ${product.name} added to your cart!`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/(modals)/cart') }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    try {
      await Share.share({
        message: `🛒 Check out ${product.name}! \n💰 LKR ${product.price} per ${product.unit}\n📝 ${product.description}`,
        title: product.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    Alert.alert(
      'Buy Now',
      `You are about to buy ${product.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', onPress: () => router.push('/(modals)/checkout') }
      ]
    );
  };

  // ✅ Get the best available image URL
  const getImageUrl = (): string => {
    if (!product) return 'https://via.placeholder.com/400/4CAF50/FFFFFF?text=No+Image';
    
    // Try multiple possible image sources
    const possibleImages = [
      (product as any).image,
      (product as any).image_url,
      (product as any).images?.[0],
      (product as any).imageUrl,
      (product as any).photo,
      (product as any).picture,
    ];
    
    for (const img of possibleImages) {
      if (img && typeof img === 'string' && img.startsWith('http')) {
        return img;
      }
    }
    
    // If no valid URL found, create a category-based placeholder
    const category = product.category || 'Default';
    const color = getCategoryColor(category);
    const name = encodeURIComponent(product.name.substring(0, 15));
    return `https://via.placeholder.com/400/${color.replace('#', '')}/FFFFFF?text=${name}`;
  };

  // ✅ Get fallback image with product name
  const getFallbackImage = (): string => {
    if (!product) return 'https://via.placeholder.com/400/4CAF50/FFFFFF?text=No+Image';
    const category = product.category || 'Default';
    const color = getCategoryColor(category);
    const name = encodeURIComponent(product.name.substring(0, 15));
    return `https://via.placeholder.com/400/${color.replace('#', '')}/FFFFFF?text=${name}`;
  };

  const imageUrl = getImageUrl();
  const fallbackUrl = getFallbackImage();

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </SafeAreaView>
    );
  }

  // Product Not Found State
  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#f44336" />
        </View>
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorText}>
          The product you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: scrollY.interpolate({
        inputRange: [0, 150],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }) }]}>
        <LinearGradient
          colors={['#E53935', '#C62828']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* ===== Image Section ===== */}
        <View style={styles.imageContainer}>
          {/* ✅ Image with error handling */}
          <Image 
            source={{ uri: imageError ? fallbackUrl : imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => {
              console.log('Image failed to load, using fallback');
              setImageError(true);
            }}
            onLoad={() => {
              console.log('Image loaded successfully');
              setImageError(false);
            }}
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
          
          {/* Floating Back Button */}
          <TouchableOpacity
            style={styles.floatingBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* Floating Share Button */}
          <TouchableOpacity
            style={styles.floatingShareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* Badges */}
          <View style={styles.badgeContainer}>
            {product.isOrganic && (
              <View style={[styles.badge, styles.organicBadge]}>
                <Text style={styles.badgeText}>🌱 Organic</Text>
              </View>
            )}
            {product.isLocal && (
              <View style={[styles.badge, styles.localBadge]}>
                <Text style={styles.badgeText}>🇱🇰 Local</Text>
              </View>
            )}
            {product.isSeasonal && (
              <View style={[styles.badge, styles.seasonalBadge]}>
                <Text style={styles.badgeText}>📅 Seasonal</Text>
              </View>
            )}
          </View>

          {/* Stock Status Badge */}
          <View style={[
            styles.stockStatusBadge,
            product.stock > 0 ? styles.inStockBadge : styles.outOfStockBadge
          ]}>
            <Text style={styles.stockStatusText}>
              {product.stock > 0 ? '● In Stock' : '● Out of Stock'}
            </Text>
          </View>
        </View>

        {/* ===== Rest of the UI (same as before) ===== */}
        {/* Product Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.namePriceContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.productName}>{product.name}</Text>
              {product.nameSi && (
                <Text style={styles.productNameSi}>{product.nameSi}</Text>
              )}
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>LKR {product.price}</Text>
              <Text style={styles.unitText}>/ {product.unit}</Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingRow}>
              <View style={styles.starContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{product.rating || 4.5}</Text>
              </View>
              <Text style={styles.reviewsText}>({product.reviews || 128} reviews)</Text>
            </View>
            <View style={styles.soldContainer}>
              <Ionicons name="trending-up" size={14} color="#4CAF50" />
              <Text style={styles.soldText}>1.2k sold</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Quick Info */}
          <View style={styles.quickInfoContainer}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="cube-outline" size={20} color="#E53935" />
              <Text style={styles.quickInfoLabel}>Stock</Text>
              <Text style={[styles.quickInfoValue, product.stock > 0 ? styles.textSuccess : styles.textDanger]}>
                {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
              </Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Ionicons name="storefront-outline" size={20} color="#E53935" />
              <Text style={styles.quickInfoLabel}>Seller</Text>
              <Text style={styles.quickInfoValue} numberOfLines={1}>
                {product.seller?.name || 'Unknown'}
              </Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Ionicons name="location-outline" size={20} color="#E53935" />
              <Text style={styles.quickInfoLabel}>Location</Text>
              <Text style={styles.quickInfoValue} numberOfLines={1}>
                {product.seller?.location || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'details' && styles.activeTab]}
              onPress={() => setActiveTab('details')}
            >
              <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
                Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'nutrition' && styles.activeTab]}
              onPress={() => setActiveTab('nutrition')}
            >
              <Text style={[styles.tabText, activeTab === 'nutrition' && styles.activeTabText]}>
                Nutrition
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                Reviews
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'details' && (
              <View>
                <Text style={styles.descriptionText}>{product.description}</Text>
                {product.tags && product.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {product.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === 'nutrition' && product.nutrition && (
              <View style={styles.nutritionContainer}>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{product.nutrition.calories}</Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{product.nutrition.protein}g</Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{product.nutrition.carbs}g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{product.nutrition.fat}g</Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{product.nutrition.fiber}g</Text>
                    <Text style={styles.nutritionLabel}>Fiber</Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'reviews' && (
              <View style={styles.reviewsContainer}>
                <View style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>JD</Text>
                    </View>
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewName}>John Doe</Text>
                      <View style={styles.reviewStars}>
                        {[1,2,3,4,5].map((star) => (
                          <Ionicons key={star} name="star" size={14} color="#FFD700" />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>2 days ago</Text>
                  </View>
                  <Text style={styles.reviewText}>Amazing product! Fresh and high quality. Will definitely buy again.</Text>
                </View>
              </View>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityWrapper}>
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={quantity > 1 ? '#E53935' : '#ccc'} />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{quantity}</Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Ionicons name="add" size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.cartButton, isInCart && styles.inCartButton]}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isInCart ? 'checkmark-circle' : 'cart-outline'} 
            size={22} 
            color="#FFFFFF" 
          />
          <Text style={styles.cartButtonText}>
            {isInCart ? 'Update Cart' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.buyButton, product.stock === 0 && styles.buyButtonDisabled]}
          onPress={handleBuyNow}
          disabled={product.stock === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.buyButtonText}>
            {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ===== Styles (same as before) =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  goBackButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: HEADER_HEIGHT,
    backgroundColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  floatingBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  floatingShareButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  organicBadge: {
    backgroundColor: '#4CAF50',
  },
  localBadge: {
    backgroundColor: '#2196F3',
  },
  seasonalBadge: {
    backgroundColor: '#FF9800',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  stockStatusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inStockBadge: {
    backgroundColor: '#4CAF50',
  },
  outOfStockBadge: {
    backgroundColor: '#F44336',
  },
  stockStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  namePriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  productNameSi: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53935',
  },
  unitText: {
    fontSize: 13,
    color: '#64748B',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
  },
  soldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soldText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8ECF0',
    marginVertical: 16,
  },
  quickInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickInfoDivider: {
    width: 1,
    backgroundColor: '#E8ECF0',
    marginHorizontal: 8,
  },
  quickInfoLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  quickInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  textSuccess: {
    color: '#4CAF50',
  },
  textDanger: {
    color: '#F44336',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#E53935',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    minHeight: 120,
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  nutritionContainer: {
    marginTop: 4,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nutritionItem: {
    flex: 1,
    minWidth: (width - 60) / 3,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  reviewsContainer: {
    gap: 12,
  },
  reviewItem: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  reviewStars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: '#64748B',
  },
  reviewText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
    lineHeight: 20,
  },
  quantityWrapper: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 30,
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  inCartButton: {
    backgroundColor: '#4CAF50',
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});