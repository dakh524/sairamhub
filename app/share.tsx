import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { submitSharedMaterial } from '../helpers/sheets';

export default function ShareScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [gmail, setGmail] = useState('');
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('');
  const [sem, setSem] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');

  const [submitting, setSubmitting] = useState(false);

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
        type,
        title,
        link,
        email: gmail,
      });

      if (success) {
        Alert.alert(
          'Submission Success',
          'Thank you! Your contributed material has been submitted for approval.',
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

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Material</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HERO ICON */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroIllustration}>➕</Text>
          <Text style={styles.heroTitle}>Contribute Study Material</Text>
          <Text style={styles.heroSubtitle}>Help your peers grow!</Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Arjun N"
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Gmail ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. arjun@gmail.com"
            placeholderTextColor={COLORS.textSecondary}
            value={gmail}
            onChangeText={setGmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Department *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. CSE, ECE"
            placeholderTextColor={COLORS.textSecondary}
            value={dept}
            onChangeText={setDept}
          />

          <Text style={styles.label}>Academic Year *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1st Year, 2nd Year"
            placeholderTextColor={COLORS.textSecondary}
            value={year}
            onChangeText={setYear}
          />

          <Text style={styles.label}>Semester *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3"
            placeholderTextColor={COLORS.textSecondary}
            value={sem}
            onChangeText={setSem}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Subject *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Digital Electronics"
            placeholderTextColor={COLORS.textSecondary}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Level *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Semester, Subject, Unit"
            placeholderTextColor={COLORS.textSecondary}
            value={level}
            onChangeText={setLevel}
          />

          <Text style={styles.label}>Resource Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Notes, Lab Materials, PYQ"
            placeholderTextColor={COLORS.textSecondary}
            value={type}
            onChangeText={setType}
          />

          <Text style={styles.label}>Document Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Unit 1 Complete Notes"
            placeholderTextColor={COLORS.textSecondary}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Google Drive Link *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. https://drive.google.com/..."
            placeholderTextColor={COLORS.textSecondary}
            value={link}
            onChangeText={setLink}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit Material'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 24,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroIllustration: {
    fontSize: 56,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
