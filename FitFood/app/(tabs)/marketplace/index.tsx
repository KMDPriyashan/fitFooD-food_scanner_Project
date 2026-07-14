import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../constants/Colors';
import { marketplaceService } from '../../services/marketplaceService';
import { Product, Category, FilterOptions, CartItem } from '../../../types/marketplace.types';
import { SAMPLE_PRODUCTS, CATEGORIES } from '../../../constants/marketplaceData';

const { width } = Dimensions.get('window');

export default function MarketplaceScreen() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    priceRange: { min: 0, max: 1000 },
    isOrganic: false,
    isLocal: false,
    isSeasonal: false,
    searchQuery: '',
  });

  useEffect(() => {
    loadProducts();
    loadCartCount();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, searchQuery, products, filters.isOrganic, filters.isLocal, filters.isSeasonal, filters.priceRange]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(SAMPLE_PRODUCTS);
      setFilteredProducts(SAMPLE_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const cart = await marketplaceService.getCart();
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartCount(0);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => 
        p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.nameSi && p.nameSi.toLowerCase().includes(q))
      );
    }

    // Organic filter - handle both property formats
    if (filters.isOrganic) {
      filtered = filtered.filter(p => {
        const isOrganic = (p as any).isOrganic !== undefined ? (p as any).isOrganic : (p as any).is_organic;
        return isOrganic === true;
      });
    }

    // Local filter - handle both property formats
    if (filters.isLocal) {
      filtered = filtered.filter(p => {
        const isLocal = (p as any).isLocal !== undefined ? (p as any).isLocal : (p as any).is_local;
        return isLocal === true;
      });
    }

    // Seasonal filter - handle both property formats
    if (filters.isSeasonal) {
      filtered = filtered.filter(p => {
        const isSeasonal = (p as any).isSeasonal !== undefined ? (p as any).isSeasonal : (p as any).is_seasonal;
        return isSeasonal === true;
      });
    }

    // Price range
    filtered = filtered.filter(p =>
      p.price >= filters.priceRange.min &&
      p.price <= filters.priceRange.max
    );

    setFilteredProducts(filtered);
  };

  // ✅ FIXED: Handle add to cart with proper CartItem structure
  const handleAddToCart = async (product: Product) => {
    try {
      const cart = await marketplaceService.getCart();
      
      // Check if product already exists in cart
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        cart[existingItemIndex].quantity += 1;
      } else {
        // ✅ FIXED: Create new cart item and PUSH it to cart
        const newCartItem = {
          id: product.id,
          quantity: 1,
          name: product.name,
          price: product.price,
          image: product.image,
          unit: product.unit,
          description: product.description,
          category: product.category,
          isOrganic: product.isOrganic,
          isLocal: product.isLocal,
          isSeasonal: product.isSeasonal,
          seller: product.seller,
          available: product.available,
          stock: product.stock,
          rating: product.rating,
          reviews: product.reviews,
          tags: product.tags,
        };
        
        // ✅ IMPORTANT: Push the new item to cart
        cart.push(newCartItem);
      }
      
      // Save updated cart
      await marketplaceService.saveCart(cart);
      
      // Update cart count
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
      
      Alert.alert(
        'Added to Cart',
        `${product.name} added to your cart!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    // Get image from multiple possible properties
    const imageUrl = (item as any).image || (item as any).image_url || 'https://via.placeholder.com/150';
    // Check both property formats
    const isOrganic = (item as any).isOrganic !== undefined ? (item as any).isOrganic : (item as any).is_organic;
    const isSeasonal = (item as any).isSeasonal !== undefined ? (item as any).isSeasonal : (item as any).is_seasonal;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push({
          pathname: '/(modals)/product-detail',
          params: { productId: item.id }
        })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
        {isOrganic && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicBadgeText}>🌱 Organic</Text>
          </View>
        )}
        {isSeasonal && (
          <View style={[styles.organicBadge, styles.seasonalBadge]}>
            <Text style={styles.organicBadgeText}>📅 Seasonal</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          {item.nameSi && (
            <Text style={styles.productNameSi} numberOfLines={1}>{item.nameSi}</Text>
          )}
          <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.productFooter}>
            <View>
              <Text style={styles.productPrice}>LKR {item.price}</Text>
              <Text style={styles.productUnit}>per {item.unit}</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => handleAddToCart(item)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item.id && styles.categoryChipTextActive,
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['#E53935', '#C62828']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🛒 Food Marketplace</Text>
          <TouchableOpacity 
            style={styles.cartBtn}
            onPress={() => router.push('/(modals)/cart')}
          >
            <Ionicons name="cart" size={24} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Fresh, healthy foods from local farmers</Text>
      </LinearGradient>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color="#E53935" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Filters</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filters.isOrganic && styles.filterChipActive]}
              onPress={() => setFilters({ ...filters, isOrganic: !filters.isOrganic })}
            >
              <Text style={[styles.filterChipText, filters.isOrganic && styles.filterChipTextActive]}>
                🌱 Organic
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filters.isLocal && styles.filterChipActive]}
              onPress={() => setFilters({ ...filters, isLocal: !filters.isLocal })}
            >
              <Text style={[styles.filterChipText, filters.isLocal && styles.filterChipTextActive]}>
                🇱🇰 Local
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filters.isSeasonal && styles.filterChipActive]}
              onPress={() => setFilters({ ...filters, isSeasonal: !filters.isSeasonal })}
            >
              <Text style={[styles.filterChipText, filters.isSeasonal && styles.filterChipTextActive]}>
                📅 Seasonal
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.filterResetBtn}
            onPress={() => {
              setFilters({
                category: 'all',
                priceRange: { min: 0, max: 1000 },
                isOrganic: false,
                isLocal: false,
                isSeasonal: false,
                searchQuery: '',
              });
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
            <Text style={styles.filterResetText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        
        <View style={styles.content}>
          {renderSearchBar()}
          
          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Products Grid */}
          <View style={styles.productsContainer}>
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🛒</Text>
                <Text style={styles.emptyTitle}>No Products Found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your filters or search term
                </Text>
                <TouchableOpacity
                  style={styles.clearFiltersBtn}
                  onPress={() => {
                    setFilters({
                      category: 'all',
                      priceRange: { min: 0, max: 1000 },
                      isOrganic: false,
                      isLocal: false,
                      isSeasonal: false,
                      searchQuery: '',
                    });
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.productsGrid}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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

  // Header
  header: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },

  // Content
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Search
  searchContainer: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    marginLeft: 10,
    paddingVertical: 0,
  },
  filterBtn: {
    padding: 4,
  },

  // Filter Panel
  filterPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  filterChipActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  filterChipText: {
    fontSize: 12,
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterResetBtn: {
    marginTop: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  filterResetText: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '600',
  },

  // Categories
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesList: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },

  // Products
  productsContainer: {
    flex: 1,
  },
  productsGrid: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  seasonalBadge: {
    left: 8,
    top: 36,
    backgroundColor: '#FF9800',
  },
  organicBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  productNameSi: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  productDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E53935',
  },
  productUnit: {
    fontSize: 10,
    color: '#94A3B8',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  clearFiltersBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#E53935',
    borderRadius: 10,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});