import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/Colors';
import { marketplaceService } from '../services/marketplaceService';
import { CartItem } from '../../types/marketplace.types';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [deliveryFee] = useState(150);
  const [tax] = useState(0.08);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadCart();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadCart = async () => {
    const cart = await marketplaceService.getCart();
    setCartItems(cart);
    calculateTotal(cart);
  };

  const calculateTotal = (items: CartItem[]) => {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxAmount = subtotal * tax;
    const grandTotal = subtotal + deliveryFee + taxAmount;
    setTotal(grandTotal);
  };

  const updateQuantity = async (id: string, change: number) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    await marketplaceService.saveCart(updated);
    calculateTotal(updated);
  };

  const removeItem = async (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = cartItems.filter(item => item.id !== id);
            setCartItems(updated);
            await marketplaceService.saveCart(updated);
            calculateTotal(updated);
          },
        },
      ]
    );
  };

  const clearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await marketplaceService.clearCart();
            setCartItems([]);
            setTotal(0);
          },
        },
      ]
    );
  };

  const checkout = () => {
    Alert.alert(
      'Checkout',
      `Total: LKR ${total.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: () => {
            Alert.alert('🎉 Order Placed!', 'Your order has been placed successfully!');
            clearCart();
            router.back();
          },
        },
      ]
    );
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxAmount = subtotal * tax;

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={['#E53935', '#C62828']}
              style={styles.emptyIconGradient}
            >
              <Ionicons name="cart-outline" size={50} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptyText}>
            Explore our healthy food collection and start shopping
          </Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.back()}>
            <LinearGradient
              colors={['#E53935', '#C62828']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shopBtnGradient}
            >
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🛒 Your Cart</Text>
          <Text style={styles.headerSubtext}>{cartItems.length} items</Text>
        </View>
        <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        style={[styles.container, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address Banner */}
        <View style={styles.deliveryBanner}>
          <View style={styles.deliveryIconContainer}>
            <Ionicons name="location-outline" size={20} color="#E53935" />
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>Delivery Address</Text>
            <Text style={styles.deliveryAddress}>123 Main Street, Colombo 07</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {cartItems.map((item, index) => (
            <Animated.View 
              key={item.id} 
              style={[
                styles.cartItem,
                { 
                  transform: [{
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 * (index + 1), 0],
                    })
                  }]
                }
              ]}
            >
              <Image 
                source={{ uri: item.image || 'https://via.placeholder.com/80/4CAF50/FFFFFF?text=Food' }} 
                style={styles.itemImage} 
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category || 'Fresh Food'}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.itemPrice}>LKR {item.price}</Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Ionicons name="remove" size={14} color="#E53935" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={14} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={18} color="#F44336" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>LKR {subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>LKR {deliveryFee.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (8%)</Text>
            <Text style={styles.summaryValue}>LKR {taxAmount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>LKR {total.toFixed(2)}</Text>
          </View>

          {/* Delivery Estimate */}
          <View style={styles.deliveryEstimate}>
            <Ionicons name="time-outline" size={18} color="#4CAF50" />
            <Text style={styles.deliveryEstimateText}>
              Estimated delivery: 30-45 minutes
            </Text>
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.promoContainer}>
          <View style={styles.promoInput}>
            <Ionicons name="pricetag-outline" size={20} color="#64748B" />
            <Text style={styles.promoPlaceholder}>Enter promo code</Text>
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTop}>
          <View style={styles.totalRow}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>LKR {total.toFixed(2)}</Text>
          </View>
          <Text style={styles.footerSubtext}>Including delivery fee & taxes</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
          <LinearGradient
            colors={['#E53935', '#C62828']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutGradient}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Delivery Banner
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  deliveryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deliveryLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  deliveryAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  changeText: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '600',
  },

  // Items
  itemsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemCategory: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 8,
  },

  // Summary
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8ECF0',
    marginVertical: 8,
  },
  totalRow: {
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E53935',
  },
  deliveryEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
  },
  deliveryEstimateText: {
    fontSize: 13,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },

  // Promo
  promoContainer: {
    marginBottom: 16,
  },
  promoInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  promoPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 8,
  },
  applyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E53935',
    borderRadius: 8,
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  shopBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shopBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerTop: {
    marginBottom: 12,
  },
  footerTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  footerTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E53935',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  checkoutBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});