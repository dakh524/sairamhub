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
        console.warn('Could not load user details', e);
      }
    };
    fetchUserDetails();
  }, []);

  const handleSubmit = async () => {
    if (!name || !gmail || !dept || !year || !sem || !subject || !level || !type || !title || !link) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
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

        Alert.alert(
          'Submission Success',
          'You added study material for the students be proud of you!',
          [{ text: 'OK', onPress: () => router.canGoBack() ? router.back() : router.replace('/') }]
        );
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
                <View style={[styles.inputContainer, focusedInput === 'dept' && styles.inputContainerFocused]}>
                  <Ionicons name="school-outline" size={20} color={focusedInput === 'dept' ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. CSE"
                    placeholderTextColor="#94A3B8"
                    value={dept}
                    onChangeText={setDept}
                    onFocus={() => setFocusedInput('dept')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Year *</Text>
                <View style={[styles.inputContainer, focusedInput === 'year' && styles.inputContainerFocused]}>
                  <Ionicons name="calendar-outline" size={20} color={focusedInput === 'year' ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 1st Year"
                    placeholderTextColor="#94A3B8"
                    value={year}
                    onChangeText={setYear}
                    onFocus={() => setFocusedInput('year')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
