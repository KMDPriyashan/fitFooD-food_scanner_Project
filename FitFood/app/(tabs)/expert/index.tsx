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
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../constants/Colors';
import { useAuth } from '../../../src/context/AuthContext';
import { expertService, Expert, ExpertFilters } from '../../services/expertService';

const { width } = Dimensions.get('window');

// ============================================
// COMPLETE DISTRICTS LIST (Static fallback)
// ============================================
const DISTRICTS = [
  'All',
  'Colombo',
  'Galle',
  'Kandy',
  'Negombo',
  'Kurunegala',
  'Matara',
  'Jaffna',
  'Batticaloa',
  'Anuradhapura',
  'Ratnapura',
  'Badulla',
  'Ampara',
  'Trincomalee',
  'Polonnaruwa',
  'Matale',
  'Nuwara Eliya',
  'Hambantota',
  'Monaragala',
  'Puttalam',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Kilinochchi',
];

// ============================================
// SPECIALTIES (Static fallback)
// ============================================
const SPECIALTIES = [
  'All',
  'Nutritionist',
  'Dietitian',
  'Ayurvedic Doctor',
  'Pregnancy Care',
  'Clinical Nutritionist',
  'Cardiologist',
  'Child Nutrition',
  'Diabetic Care',
  'Women\'s Health',
  'Community Nutrition',
  'Rural Health',
  'Herbal Medicine',
  'Weight Management',
];

// ============================================
// AVAILABLE DATES & TIMES
// ============================================
const AVAILABLE_DATES = [
  { label: 'Mon 14', value: '2024-07-14' },
  { label: 'Tue 15', value: '2024-07-15' },
  { label: 'Wed 16', value: '2024-07-16' },
  { label: 'Thu 17', value: '2024-07-17' },
  { label: 'Fri 18', value: '2024-07-18' },
  { label: 'Sat 19', value: '2024-07-19' },
  { label: 'Mon 21', value: '2024-07-21' },
  { label: 'Tue 22', value: '2024-07-22' },
];

const AVAILABLE_TIMES = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
];

export default function ScanScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking Form States
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');

  // ✅ Become Expert Modal States
  const [showExpertForm, setShowExpertForm] = useState(false);
  const [expertFormLoading, setExpertFormLoading] = useState(false);
  const [expertForm, setExpertForm] = useState({
    name: '',
    title: '',
    specialty: '',
    qualification: '',
    experience: '',
    district: '',
    phone: '',
    whatsapp: '',
    email: '',
    description: '',
    profileImage: '',
  });

  // Load experts from database
  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    setLoading(true);
    try {
      const data = await expertService.getAllExperts();
      setExperts(data);
      setFilteredExperts(data);
    } catch (error) {
      console.error('Error loading experts:', error);
      Alert.alert('Error', 'Failed to load experts');
    } finally {
      setLoading(false);
    }
  };

  // Filter experts when filters change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedDistrict, selectedSpecialty, experts]);

  const applyFilters = () => {
    const filters: ExpertFilters = {
      searchQuery,
      district: selectedDistrict,
      specialty: selectedSpecialty,
    };

    let filtered = [...experts];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(expert =>
        expert.name.toLowerCase().includes(query) ||
        expert.title.toLowerCase().includes(query) ||
        expert.specialty.toLowerCase().includes(query)
      );
    }

    // District filter
    if (filters.district && filters.district !== 'All') {
      filtered = filtered.filter(expert => expert.district === filters.district);
    }

    // Specialty filter
    if (filters.specialty && filters.specialty !== 'All') {
      filtered = filtered.filter(expert => expert.title === filters.specialty);
    }

    setFilteredExperts(filtered);
  };

  // Get visible districts
  const visibleDistricts = showAllDistricts ? DISTRICTS : DISTRICTS.slice(0, 6);

  const connectViaWhatsApp = (phone: string, name: string) => {
    const url = `whatsapp://send?phone=94${phone}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp to connect');
      }
    });
  };

  const connectViaEmail = (email: string, name: string) => {
    const subject = `Consultation Request - FitFood App`;
    const body = `Dear ${name},\n\nI would like to schedule a consultation regarding my nutrition needs.\n\nThank you.`;
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url);
  };

  const connectViaPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleBookAppointment = (expert: Expert) => {
    setSelectedExpert(expert);
    setSelectedDate('');
    setSelectedTime('');
    setBookingNotes('');
    setBookingEmail(user?.email || '');
    setBookingPhone(user?.phone || '');
    setShowBooking(true);
  };

  // ✅ Send Email via Linking
  const sendBookingEmail = async () => {
    if (!selectedExpert) return;

    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time');
      return;
    }
    if (!bookingEmail.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setBookingLoading(true);

    try {
      const subject = `📅 Consultation Booking - ${selectedExpert.name}`;
      const body = `
Dear ${selectedExpert.name},

I would like to schedule a consultation with you.

📋 Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email: ${bookingEmail}
📱 Phone: ${bookingPhone || 'Not provided'}
📅 Preferred Date: ${selectedDate}
⏰ Preferred Time: ${selectedTime}
🏥 Specialty: ${selectedExpert.specialty}

📝 Health Concerns / Notes:
${bookingNotes || 'No additional notes provided.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please confirm if this time slot is available.

Thank you,
${bookingEmail || 'FitFood App User'}

---
📱 Sent via FitFood App
🌐 https://fitfood.app
`;

      const mailtoUrl = `mailto:${selectedExpert.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      const supported = await Linking.canOpenURL(mailtoUrl);
      
      if (supported) {
        await Linking.openURL(mailtoUrl);
        Alert.alert(
          '✅ Booking Request Sent',
          `Your consultation request has been sent to ${selectedExpert.name}.\n\nPlease check your email for confirmation.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowBooking(false);
                setBookingLoading(false);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Email Client Not Found',
          'Please install an email client to send the booking request.',
          [{ text: 'OK' }]
        );
        setBookingLoading(false);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'Failed to send booking request. Please try again.');
      setBookingLoading(false);
    }
  };

  // ✅ Handle Become Expert Form Submission
  const handleBecomeExpert = async () => {
    // Validate form
    if (!expertForm.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!expertForm.title.trim()) {
      Alert.alert('Error', 'Please enter your title');
      return;
    }
    if (!expertForm.specialty.trim()) {
      Alert.alert('Error', 'Please enter your specialty');
      return;
    }
    if (!expertForm.qualification.trim()) {
      Alert.alert('Error', 'Please enter your qualification');
      return;
    }
    if (!expertForm.experience.trim()) {
      Alert.alert('Error', 'Please enter your experience');
      return;
    }
    if (!expertForm.district.trim()) {
      Alert.alert('Error', 'Please select your district');
      return;
    }
    if (!expertForm.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (!expertForm.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setExpertFormLoading(true);

    try {
      // Create expert object
      const newExpert: Omit<Expert, 'id' | 'rating' | 'reviews'> = {
        name: expertForm.name.trim(),
        title: expertForm.title.trim(),
        specialty: expertForm.specialty.trim(),
        qualification: expertForm.qualification.trim(),
        experience: expertForm.experience.trim(),
        district: expertForm.district.trim(),
        phone: expertForm.phone.trim(),
        whatsapp: expertForm.whatsapp.trim() || expertForm.phone.trim(),
        email: expertForm.email.trim(),
        description: expertForm.description.trim(),
        profileImage: expertForm.profileImage || 'https://via.placeholder.com/100/4CAF50/FFFFFF?text=Expert',
        available: true,
        createdAt: new Date().toISOString(),
      };

      // Save to database
      const savedExpert = await expertService.createExpert(newExpert);
      
      // Add to local state
      setExperts([savedExpert, ...experts]);
      setFilteredExperts([savedExpert, ...filteredExperts]);

      Alert.alert(
        '🎉 Success!',
        'Your expert profile has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowExpertForm(false);
              setExpertFormLoading(false);
              // Reset form
              setExpertForm({
                name: '',
                title: '',
                specialty: '',
                qualification: '',
                experience: '',
                district: '',
                phone: '',
                whatsapp: '',
                email: '',
                description: '',
                profileImage: '',
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating expert:', error);
      Alert.alert('Error', 'Failed to create expert profile. Please try again.');
      setExpertFormLoading(false);
    }
  };

  // ✅ Render Become Expert Button
  const renderBecomeExpertButton = () => (
    <TouchableOpacity
      style={styles.becomeExpertBtn}
      onPress={() => setShowExpertForm(true)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#E53935', '#C62828']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.becomeExpertGradient}
      >
        <Ionicons name="person-add-outline" size={22} color="#FFFFFF" />
        <Text style={styles.becomeExpertText}>Become an Expert</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );

  // ✅ Render Become Expert Modal
  const renderExpertFormModal = () => {
    if (!showExpertForm) return null;

    return (
      <Modal
        visible={showExpertForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExpertForm(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowExpertForm(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👨‍⚕️ Become an Expert</Text>
              <TouchableOpacity onPress={() => setShowExpertForm(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.expertFormContainer}>
                {/* Profile Image Placeholder */}
                <View style={styles.profileImageContainer}>
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageText}>
                      {expertForm.name ? expertForm.name.charAt(0).toUpperCase() : '👤'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.uploadImageBtn}>
                    <Text style={styles.uploadImageText}>Upload Photo</Text>
                  </TouchableOpacity>
                </View>

                {/* Full Name */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Dr. John Doe"
                    placeholderTextColor="#94A3B8"
                    value={expertForm.name}
                    onChangeText={(text) => setExpertForm({ ...expertForm, name: text })}
                  />
                </View>

                {/* Title / Designation */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Title / Designation *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g., Nutritionist, Dietitian"
                    placeholderTextColor="#94A3B8"
                    value={expertForm.title}
                    onChangeText={(text) => setExpertForm({ ...expertForm, title: text })}
                  />
                </View>

                {/* Specialty */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Specialty *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g., Clinical Nutrition, Child Nutrition"
                    placeholderTextColor="#94A3B8"
                    value={expertForm.specialty}
                    onChangeText={(text) => setExpertForm({ ...expertForm, specialty: text })}
                  />
                </View>

                {/* Qualification */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Qualification *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g., BSc in Nutrition, MD"
                    placeholderTextColor="#94A3B8"
                    value={expertForm.qualification}
                    onChangeText={(text) => setExpertForm({ ...expertForm, qualification: text })}
                  />
                </View>

                {/* Experience */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Experience *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g., 5+ years, 10 years experience"
                    placeholderTextColor="#94A3B8"
                    value={expertForm.experience}
                    onChangeText={(text) => setExpertForm({ ...expertForm, experience: text })}
                  />
                </View>

                {/* District */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>District *</Text>
                  <View style={styles.districtPicker}>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Select or enter district"
                      placeholderTextColor="#94A3B8"
                      value={expertForm.district}
                      onChangeText={(text) => setExpertForm({ ...expertForm, district: text })}
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0712345678"
                    placeholderTextColor="#94A3B8"
                    value={expertForm.phone}
                    onChangeText={(text) => setExpertForm({ ...expertForm, phone: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* WhatsApp */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>WhatsApp Number</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0712345678 (Same as phone if not provided)"
                    placeholderTextColor="#94A3B8"
                    value={expertForm.whatsapp}
                    onChangeText={(text) => setExpertForm({ ...expertForm, whatsapp: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Email */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Email *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="john@example.com"
                    placeholderTextColor="#94A3B8"
                    value={expertForm.email}
                    onChangeText={(text) => setExpertForm({ ...expertForm, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>About / Description</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="Tell us about your expertise and experience..."
                    placeholderTextColor="#94A3B8"
                    value={expertForm.description}
                    onChangeText={(text) => setExpertForm({ ...expertForm, description: text })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.modalCancelBtn]}
                    onPress={() => setShowExpertForm(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.modalConfirmBtn]}
                    onPress={handleBecomeExpert}
                    disabled={expertFormLoading}
                  >
                    <LinearGradient
                      colors={['#E53935', '#C62828']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.modalBookGradient}
                    >
                      {expertFormLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.modalBookText}>Submit Profile</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  };

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
          <Text style={styles.headerTitle}>👨‍⚕️ Expert Panel</Text>
          <TouchableOpacity style={styles.profileBtn}>
            <Ionicons name="person-circle" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Connect with health experts near you</Text>
        {renderBecomeExpertButton()}
      </LinearGradient>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filterContainer}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or specialty..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Stats */}
      <View style={styles.filterStats}>
        <Text style={styles.filterStatsText}>
          {filteredExperts.length} experts found
        </Text>
        {(selectedDistrict !== 'All' || selectedSpecialty !== 'All') && (
          <TouchableOpacity
            style={styles.clearFiltersBtn}
            onPress={() => {
              setSelectedDistrict('All');
              setSelectedSpecialty('All');
            }}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* District Filter - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterScrollContent}
      >
        {visibleDistricts.map((district) => (
          <TouchableOpacity
            key={district}
            style={[
              styles.filterChip,
              selectedDistrict === district && styles.filterChipActive,
            ]}
            onPress={() => setSelectedDistrict(district)}
          >
            <Text style={[
              styles.filterChipText,
              selectedDistrict === district && styles.filterChipTextActive,
            ]}>
              {district}
            </Text>
            {selectedDistrict === district && (
              <View style={styles.chipCheck}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.showMoreBtn}
          onPress={() => setShowAllDistricts(!showAllDistricts)}
        >
          <Text style={styles.showMoreText}>
            {showAllDistricts ? 'Show Less ▲' : 'Show More ▼'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Specialty Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterScroll, { marginTop: 8 }]}
        contentContainerStyle={styles.filterScrollContent}
      >
        {SPECIALTIES.map((specialty) => (
          <TouchableOpacity
            key={specialty}
            style={[
              styles.filterChip,
              styles.specialtyChip,
              selectedSpecialty === specialty && styles.filterChipActive,
            ]}
            onPress={() => setSelectedSpecialty(specialty)}
          >
            <Text style={[
              styles.filterChipText,
              selectedSpecialty === specialty && styles.filterChipTextActive,
            ]}>
              {specialty}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderExpertCard = (expert: Expert) => (
    <TouchableOpacity
      key={expert.id}
      style={styles.expertCard}
      onPress={() => {
        setSelectedExpert(expert);
        setShowBooking(true);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.expertHeader}>
        <View style={[styles.expertAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.expertAvatarText}>{expert.name.charAt(0)}</Text>
        </View>
        <View style={styles.expertInfo}>
          <Text style={styles.expertName}>{expert.name}</Text>
          <Text style={styles.expertTitle}>{expert.title}</Text>
          <View style={styles.expertMeta}>
            <Text style={styles.expertSpecialty}>{expert.specialty}</Text>
            <Text style={styles.expertDistrict}>📍 {expert.district}</Text>
          </View>
        </View>
        <View style={styles.expertRating}>
          <Ionicons name="star" size={16} color="#FDCB6E" />
          <Text style={styles.ratingText}>{expert.rating || 4.5}</Text>
          <Text style={styles.reviewText}>({expert.reviews || 0})</Text>
        </View>
      </View>

      <View style={styles.expertFooter}>
        <View style={styles.expertDetails}>
          <Text style={styles.expertQualification}>{expert.qualification}</Text>
          <Text style={styles.expertExperience}>⏱ {expert.experience}</Text>
        </View>
        <View style={styles.expertActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => connectViaWhatsApp(expert.whatsapp, expert.name)}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => connectViaEmail(expert.email, expert.name)}
          >
            <Ionicons name="mail" size={20} color="#E53935" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => connectViaPhone(expert.phone)}
          >
            <Ionicons name="call" size={20} color="#4A3AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.bookBtn]}
            onPress={() => handleBookAppointment(expert)}
          >
            <Ionicons name="calendar" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBookingModal = () => {
    if (!showBooking || !selectedExpert) return null;

    return (
      <Modal
        visible={showBooking}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBooking(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowBooking(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📅 Book Consultation</Text>
              <TouchableOpacity onPress={() => setShowBooking(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalExpertInfo}>
                <Text style={styles.modalExpertName}>{selectedExpert.name}</Text>
                <Text style={styles.modalExpertTitle}>{selectedExpert.title}</Text>
                <Text style={styles.modalExpertSpecialty}>{selectedExpert.specialty}</Text>
                <Text style={styles.modalExpertEmail}>📧 {selectedExpert.email}</Text>
              </View>

              <View style={styles.modalForm}>
                <View>
                  <Text style={styles.modalLabel}>📧 Your Email *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your email"
                    placeholderTextColor="#94A3B8"
                    value={bookingEmail}
                    onChangeText={setBookingEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View>
                  <Text style={styles.modalLabel}>📱 Your Phone (Optional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#94A3B8"
                    value={bookingPhone}
                    onChangeText={setBookingPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View>
                  <Text style={styles.modalLabel}>📅 Select Date *</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.modalDateScroll}
                  >
                    {AVAILABLE_DATES.map((date) => (
                      <TouchableOpacity
                        key={date.value}
                        style={[
                          styles.modalDateBtn,
                          selectedDate === date.value && styles.modalDateBtnActive,
                        ]}
                        onPress={() => setSelectedDate(date.value)}
                      >
                        <Text style={[
                          styles.modalDateText,
                          selectedDate === date.value && styles.modalDateTextActive,
                        ]}>
                          {date.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View>
                  <Text style={styles.modalLabel}>⏰ Select Time *</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.modalTimeScroll}
                  >
                    {AVAILABLE_TIMES.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.modalTimeBtn,
                          selectedTime === time && styles.modalTimeBtnActive,
                        ]}
                        onPress={() => setSelectedTime(time)}
                      >
                        <Text style={[
                          styles.modalTimeText,
                          selectedTime === time && styles.modalTimeTextActive,
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View>
                  <Text style={styles.modalLabel}>📝 Health Concerns / Notes (Optional)</Text>
                  <TextInput
                    style={styles.modalTextArea}
                    placeholder="Describe your health concerns or any specific requirements..."
                    placeholderTextColor="#94A3B8"
                    value={bookingNotes}
                    onChangeText={setBookingNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.modalCancelBtn]}
                    onPress={() => setShowBooking(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.modalConfirmBtn]}
                    onPress={sendBookingEmail}
                    disabled={bookingLoading}
                  >
                    <LinearGradient
                      colors={['#E53935', '#C62828']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.modalBookGradient}
                    >
                      {bookingLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.modalBookText}>Confirm Booking</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading experts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderFilters()}
        
        <View style={styles.resultsContainer}>
          {filteredExperts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>😕</Text>
              <Text style={styles.emptyTitle}>No Experts Found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your filters or search term
              </Text>
              <TouchableOpacity
                style={styles.emptyResetBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedDistrict('All');
                  setSelectedSpecialty('All');
                }}
              >
                <Text style={styles.emptyResetText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredExperts.map(renderExpertCard)
          )}
          
          <View style={styles.connectFooter}>
            <Text style={styles.footerText}>💡 Need immediate help?</Text>
            <Text style={styles.footerSubText}>Connect with experts via WhatsApp or Email</Text>
          </View>
        </View>
      </ScrollView>

      {renderBookingModal()}
      {renderExpertFormModal()}
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
    paddingTop: 62,
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
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },

  // Become Expert Button
  becomeExpertBtn: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  becomeExpertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 10,
  },
  becomeExpertText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Filters
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  filterStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  filterStatsText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  clearFiltersBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '600',
  },
  filterScroll: {
    marginTop: 4,
  },
  filterScrollContent: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  specialtyChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipCheck: {
    marginLeft: 4,
  },
  showMoreBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  showMoreText: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '600',
  },

  // Results
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    marginTop: 12,
  },

  // Expert Card
  expertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  expertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expertAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expertAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  expertTitle: {
    fontSize: 13,
    color: '#64748B',
  },
  expertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  expertSpecialty: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '500',
  },
  expertDistrict: {
    fontSize: 12,
    color: '#64748B',
  },
  expertRating: {
    alignItems: 'center',
    paddingLeft: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  reviewText: {
    fontSize: 11,
    color: '#94A3B8',
  },

  expertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  expertDetails: {
    flex: 1,
  },
  expertQualification: {
    fontSize: 12,
    color: '#64748B',
  },
  expertExperience: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  expertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  bookBtn: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },

  // Footer
  connectFooter: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  emptyResetBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#E53935',
  },
  emptyResetText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(11, 10, 7, 0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalExpertInfo: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalExpertName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalExpertTitle: {
    fontSize: 13,
    color: '#64748B',
  },
  modalExpertSpecialty: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '500',
  },
  modalExpertEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  modalForm: {
    gap: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
  },
  modalDateScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  modalDateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    marginRight: 8,
  },
  modalDateBtnActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  modalDateText: {
    fontSize: 13,
    color: '#1E293B',
  },
  modalDateTextActive: {
    color: '#FFFFFF',
  },
  modalTimeScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  modalTimeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    marginRight: 8,
  },
  modalTimeBtnActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  modalTimeText: {
    fontSize: 13,
    color: '#1E293B',
  },
  modalTimeTextActive: {
    color: '#FFFFFF',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingBottom: 8,
  },
  modalActionBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalCancelBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 2,
  },
  modalBookGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBookText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // ✅ Expert Form Styles
  expertFormContainer: {
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  districtPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImageText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  uploadImageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  uploadImageText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});