import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { supabase } from '../helpers/supabase';

export default function AdminScreen() {
  const router = useRouter();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');

  // Form State for Company Drive
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = () => {
    // Basic hardcoded passcode for admin access
    if (passcode === 'admin@123' || passcode === 'sairam2026') {
      setIsAuthenticated(true);
    } else {
      Alert.alert('Access Denied', 'Incorrect admin passcode.');
      setPasscode('');
    }
  };

  const handleAddDrive = async () => {
    if (!company || !role || !date || !link) {
      Alert.alert('Missing Fields', 'Please fill all required fields (*)');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('company_drives')
        .insert([
          {
            company,
            role,
            drive_date: date,
            link,
            logo_url: logoUrl || 'https://logo.clearbit.com/default.com', // fallback
            is_active: true,
          }
        ]);

      if (error) {
        throw error;
      }

      Alert.alert('Success!', 'Company Drive link has been added successfully.');
      
      // Clear form
      setCompany('');
      setRole('');
      setDate('');
      setLink('');
      setLogoUrl('');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to add company drive. Is Supabase table created?');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Access</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.loginContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.loginTitle}>Admin Restricted Area</Text>
          <Text style={styles.loginSub}>Enter passcode to manage app content.</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Enter Passcode"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={passcode}
              onChangeText={setPasscode}
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Unlock Panel</Text>
            <Ionicons name="key-outline" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // === ADMIN DASHBOARD ===
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => setIsAuthenticated(false)}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          <Text style={styles.sectionTitle}>Add New Company Drive</Text>
          
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. TCS (Ninja/Digital)"
                placeholderTextColor="#94A3B8"
                value={company}
                onChangeText={setCompany}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Job Role *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Software Engineer"
                placeholderTextColor="#94A3B8"
                value={role}
                onChangeText={setRole}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Drive Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 25 Aug 2026"
                placeholderTextColor="#94A3B8"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Application Link *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. https://www.tcs.com/careers"
                placeholderTextColor="#94A3B8"
                value={link}
                onChangeText={setLink}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Logo URL (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. https://logo.clearbit.com/tcs.com"
                placeholderTextColor="#94A3B8"
                value={logoUrl}
                onChangeText={setLogoUrl}
                autoCapitalize="none"
              />
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                Leave blank for default. Hint: use logo.clearbit.com/companydomain.com
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleAddDrive}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Add Drive Link</Text>
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  loginSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 32,
  },
  loginBtn: {
    backgroundColor: '#0F172A',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1E293B',
  },
  submitBtn: {
    backgroundColor: '#6B5DF6',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#6B5DF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
