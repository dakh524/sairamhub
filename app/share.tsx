import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { submitSharedMaterial } from '../helpers/api';
import { scheduleLocalNotification } from '../helpers/notifications';

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const LEVELS = ['Semester', 'Subject', 'Unit'];
const TYPES = ['Notes', 'Question Bank', 'Lab Material', 'Record', 'Syllabus', 'Other'];
const DEPARTMENTS = [
  'COMMON', 'CSE', 'ECE', 'MECH', 'IT', 'EEE', 'AI & DS', 'CSE (AI & ML)',
  'CSBS', 'CIVIL', 'CCE', 'CSE (Cyber Security)', 'CSE (IoT)', 'EIE',
  'ICE', 'MZ', 'MU', 'MBA', 'M.Tech CSE', 'H & S'
];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

export default function ShareScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [gmail, setGmail] = useState('');
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('');
  const [sem, setSem] = useState('1');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('Subject');
  const [type, setType] = useState('Notes');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    // Auto-fill user details from AsyncStorage
    const fetchUserDetails = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedDept = await AsyncStorage.getItem('userDept');
        const storedYear = await AsyncStorage.getItem('userYear');

        if (storedName) setName(storedName);
        if (storedEmail) setGmail(storedEmail);
        if (storedDept) setDept(storedDept);
        if (storedYear) setYear(storedYear);
      } catch (e) {
        console.error('Failed to fetch user details from storage', e);
      }
    };
    fetchUserDetails();
  }, []);

  const handleSubmit = async () => {
    if (!name || !gmail || !dept || !year || !subject || !title || !link) {
      Alert.alert('Missing Fields', 'Please fill out all required fields marked with *.');
      return;
    }

    setSubmitting(true);
    try {
      const success = await submitSharedMaterial({
        name,
        dept,
        year,
        sem,
        subject,
        level,
        type,
        title,
        link,
        email: gmail,
      });

      if (success) {
        // Trigger push/local notification
        scheduleLocalNotification(
          '📚 New Study Material Uploaded!',
          `"${title}" for ${subject} (Sem ${sem}) is now available in Sairam Hub.`
        );

        setShowSuccessModal(true);
      } else {
        throw new Error('Submission endpoint did not return success.');
      }
    } catch (error: any) {
      Alert.alert(
        'Submission Failed',
        error.message || 'An error occurred while submitting. Please verify your connection.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderChipGroup = (label: string, options: string[], selectedValue: string, onSelect: (val: string) => void) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label} *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
        {options.map((opt) => {
          const isActive = selectedValue === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{opt}</Text>
              {isActive && <Ionicons name="checkmark-circle" size={16} color="#6B5DF6" style={styles.chipIcon} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderPickerModal = (
    visible: boolean,
    setVisible: (v: boolean) => void,
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (val: string) => void
  ) => (
    <Modal visible={visible} transparent={true} animationType="slide">
      <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
        <View style={styles.pickerContent}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.pickerCloseBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
            {options.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.pickerItem, selectedValue === item && styles.pickerItemSelected]}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <Text style={[styles.pickerItemText, selectedValue === item && styles.pickerItemTextSelected]}>
                  {item}
                </Text>
                {selectedValue === item && <Ionicons name="checkmark-circle" size={20} color="#6B5DF6" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Material</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        >
          {/* HERO ICON */}
          <View style={styles.heroContainer}>
            <View style={styles.iconOuter}>
              <View style={styles.iconGradient}>
                <Ionicons name="cloud-upload" size={32} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.heroTitle}>Contribute Material</Text>
            <Text style={styles.heroSubtitle}>Help your peers grow!</Text>
          </View>

          {/* FORM */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Your Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name *</Text>
              <View style={[styles.inputContainer, focusedInput === 'name' && styles.inputContainerFocused]}>
                <Ionicons name="person-outline" size={20} color={focusedInput === 'name' ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Arjun N"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gmail ID *</Text>
              <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputContainerFocused]}>
                <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. arjun@gmail.com"
                  placeholderTextColor="#94A3B8"
                  value={gmail}
                  onChangeText={setGmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Department *</Text>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  onPress={() => setShowDeptPicker(true)}
                  style={[styles.inputContainer, showDeptPicker && styles.inputContainerFocused]}
                >
                  <Ionicons name="school-outline" size={20} color={showDeptPicker ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                  <Text style={[styles.input, { color: dept ? COLORS.text : '#94A3B8', paddingTop: Platform.OS === 'ios' ? 15 : 12 }]}>
                    {dept || 'Select Dept'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Year *</Text>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  onPress={() => setShowYearPicker(true)}
                  style={[styles.inputContainer, showYearPicker && styles.inputContainerFocused]}
                >
                  <Ionicons name="calendar-outline" size={20} color={showYearPicker ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                  <Text style={[styles.input, { color: year ? COLORS.text : '#94A3B8', paddingTop: Platform.OS === 'ios' ? 15 : 12 }]}>
                    {year || 'Select Year'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Material Details</Text>

            {renderChipGroup('Semester', SEMESTERS, sem, setSem)}
            {renderChipGroup('Resource Type', TYPES, type, setType)}
            {renderChipGroup('Level', LEVELS, level, setLevel)}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject *</Text>
              <View style={[styles.inputContainer, focusedInput === 'subject' && styles.inputContainerFocused]}>
                <Ionicons name="book-outline" size={20} color={focusedInput === 'subject' ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Digital Electronics"
                  placeholderTextColor="#94A3B8"
                  value={subject}
                  onChangeText={setSubject}
                  onFocus={() => setFocusedInput('subject')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Document Title *</Text>
              <View style={[styles.inputContainer, focusedInput === 'title' && styles.inputContainerFocused]}>
                <Ionicons name="document-text-outline" size={20} color={focusedInput === 'title' ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Unit 1 Complete Notes"
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={setTitle}
                  onFocus={() => setFocusedInput('title')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Google Drive Link *</Text>
              <View style={[styles.inputContainer, focusedInput === 'link' && styles.inputContainerFocused]}>
                <Ionicons name="link-outline" size={20} color={focusedInput === 'link' ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. https://drive.google.com/..."
                  placeholderTextColor="#94A3B8"
                  value={link}
                  onChangeText={setLink}
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('link')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <View style={styles.submitButton}>
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Material'}
                </Text>
                {!submitting && <Ionicons name="arrow-forward" size={20} color="#fff" />}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* PICKER MODALS */}
      {renderPickerModal(showDeptPicker, setShowDeptPicker, 'Select Department', DEPARTMENTS, dept, setDept)}
      {renderPickerModal(showYearPicker, setShowYearPicker, 'Select Year', YEARS, year, setYear)}

      {/* PROUD CONTRIBUTOR SUCCESS MODAL */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderBadge}>
              <Text style={{ fontSize: 36 }}>🎓</Text>
            </View>
            
            <Text style={styles.modalTitle}>Be Proud of Yourself, {name || 'Student'}! 🌟</Text>
            
            <Text style={styles.modalSubMessage}>
              You contributed valuable study material that will help hundreds of students across Sairam Institutions!
            </Text>

            {/* AUTOMATIC ALLOCATION SUMMARY */}
            <View style={styles.allocationSummaryBox}>
              <Text style={styles.allocationHeaderTitle}>📍 Automatically Live & Allocated To:</Text>
              
              <View style={styles.allocationRow}>
                <Ionicons name="school" size={16} color="#6B5DF6" />
                <Text style={styles.allocationRowText}>Department: <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>{dept.toUpperCase()}</Text></Text>
              </View>
              
              <View style={styles.allocationRow}>
                <Ionicons name="calendar" size={16} color="#6B5DF6" />
                <Text style={styles.allocationRowText}>Semester: <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>Semester {sem}</Text></Text>
              </View>

              <View style={styles.allocationRow}>
                <Ionicons name="book" size={16} color="#6B5DF6" />
                <Text style={styles.allocationRowText}>Subject: <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>{subject}</Text></Text>
              </View>

              <View style={styles.allocationRow}>
                <Ionicons name="document-text" size={16} color="#6B5DF6" />
                <Text style={styles.allocationRowText}>Category: <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>{type} ("{title}")</Text></Text>
              </View>
            </View>

            <View style={styles.modalActionGroup}>
              <TouchableOpacity
                style={styles.primaryViewBtn}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.replace({
                    pathname: '/resources',
                    params: { sem, dept: dept.toUpperCase(), subject, type }
                  });
                }}
              >
                <Ionicons name="eye-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryViewBtnText}>View My Material Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryNotificationBtn}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.replace('/updates');
                }}
              >
                <Ionicons name="notifications-outline" size={18} color="#6B5DF6" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryNotificationBtnText}>Check Notification Entry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.homeBackBtn}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.replace('/');
                }}
              >
                <Text style={styles.homeBackBtnText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#6B5DF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubMessage: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  allocationSummaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  allocationHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B5DF6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  allocationRowText: {
    fontSize: 13,
    color: '#334155',
    marginLeft: 8,
    flex: 1,
  },
  modalActionGroup: {
    width: '100%',
    gap: 10,
  },
  primaryViewBtn: {
    backgroundColor: '#6B5DF6',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryViewBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryNotificationBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryNotificationBtnText: {
    color: '#6B5DF6',
    fontWeight: 'bold',
    fontSize: 14,
  },
  homeBackBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  homeBackBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F6FF',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconOuter: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 50,
    marginBottom: 12,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6B5DF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B5DF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCFDFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputContainerFocused: {
    borderColor: '#6B5DF6',
    backgroundColor: '#F9FAFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    height: '100%',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    paddingRight: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#F5F5FF',
    borderColor: '#6B5DF6',
  },
  chipText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#6B5DF6',
    fontWeight: '700',
  },
  chipIcon: {
    marginLeft: 6,
  },
  submitButtonContainer: {
    marginTop: 10,
    borderRadius: 14,
    shadowColor: '#6B5DF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButton: {
    backgroundColor: '#6B5DF6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  pickerCloseBtn: {
    padding: 4,
  },
  pickerList: {
    marginBottom: 20,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerItemSelected: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
  },
  pickerItemText: {
    fontSize: 15,
    color: '#475569',
  },
  pickerItemTextSelected: {
    color: '#6B5DF6',
    fontWeight: '700',
  },
});
