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
  }, [selectedCategory, searchQuery, products, filters]);

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
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.nameSi?.toLowerCase().includes(q)
      );
    }

    // Advanced filters
    if (filters.isOrganic) {
      filtered = filtered.filter(p => p.isOrganic);
    }
    if (filters.isLocal) {
      filtered = filtered.filter(p => p.isLocal);
    }
    if (filters.isSeasonal) {
      filtered = filtered.filter(p => p.isSeasonal);
    }

    // Price range
    filtered = filtered.filter(p =>
      p.price >= filters.priceRange.min &&
      p.price <= filters.priceRange.max
    );

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product: Product) => {
    const cart = await marketplaceService.getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    await marketplaceService.saveCart(cart);
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    Alert.alert('Added to Cart', `${product.name} added to your cart!`);
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push({
        pathname: '/(modals)/product-detail',
        params: { productId: item.id }
      })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      {item.isOrganic && (
        <View style={styles.organicBadge}>
          <Text style={styles.organicBadgeText}>🌱 Organic</Text>
        </View>
      )}
      {item.isSeasonal && (
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
            onPress={() => setFilters({
              category: 'all',
              priceRange: { min: 0, max: 1000 },
              isOrganic: false,
              isLocal: false,
              isSeasonal: false,
              searchQuery: '',
            })}
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
    paddingTop: 12,
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
});