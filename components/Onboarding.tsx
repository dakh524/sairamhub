import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../helpers/supabase';

interface OnboardingProps {
  onComplete: () => void;
}

const DEPARTMENTS = ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'MECH'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [customDept, setCustomDept] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = async () => {
    if (isLogin) {
      if (!name.trim() || !mobile.trim()) {
        Alert.alert('Missing Info', 'Please enter your name and mobile number.');
        return;
      }
      setIsSubmitting(true);
      try {
        const { data: existingUsers, error: searchError } = await supabase
          .from('users')
          .select('*')
          .eq('mobile', mobile.trim())
          .ilike('name', name.trim());

        if (searchError) {
          console.warn('Error checking existing user:', searchError);
        }

        if (existingUsers && existingUsers.length > 0) {
          const user = existingUsers[0];
          await AsyncStorage.setItem('userName', user.name || name.trim());
          await AsyncStorage.setItem('userEmail', user.email || '');
          await AsyncStorage.setItem('userMobile', user.mobile || mobile.trim());
          await AsyncStorage.setItem('userDept', user.department || '');
          await AsyncStorage.setItem('userYear', user.year || '');
          await AsyncStorage.setItem('hasOnboarded', 'true');
          onComplete();
        } else {
          Alert.alert('Not Found', 'No registered user found with this name and mobile number.');
        }
      } catch (e) {
        Alert.alert('Error', 'Verification failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const finalDept = department === 'Other' ? customDept.trim() : department;

    if (!name.trim() || !email.trim() || !mobile.trim()) {
      Alert.alert('Missing Info', 'Please fill out your name, email, and mobile number.');
      return;
    }
    if (!finalDept) {
      Alert.alert('Missing Info', 'Please select or enter your department.');
      return;
    }
    if (!year) {
      Alert.alert('Missing Info', 'Please select your year.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user already exists by email or mobile
      const { data: existingUsers, error: searchError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email.trim()},mobile.eq.${mobile.trim()}`);

      if (searchError) {
        console.warn('Error checking existing user:', searchError);
      }

      if (existingUsers && existingUsers.length > 0) {
        // User exists, update their record instead of inserting a duplicate
        const existingUser = existingUsers[0];
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: name.trim(),
            department: finalDept,
            year: year,
            email: email.trim(),
            mobile: mobile.trim()
          })
          .eq('id', existingUser.id);
          
        if (updateError) console.warn('Could not update user:', updateError);
      } else {
        // New user, insert
        const { error: insertError } = await supabase.from('users').insert([{
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          department: finalDept,
          year: year
        }]);

        if (insertError) console.warn('Could not save user:', insertError);
      }

      // Save locally to unlock app
      await AsyncStorage.setItem('userName', name.trim());
      await AsyncStorage.setItem('userEmail', email.trim());
      await AsyncStorage.setItem('userMobile', mobile.trim());
      await AsyncStorage.setItem('userDept', finalDept);
      await AsyncStorage.setItem('userYear', year);
      await AsyncStorage.setItem('hasOnboarded', 'true');

      onComplete();
    } catch (e) {
      Alert.alert('Error', 'Failed to save your details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#F4F6FF', '#EBEFFF']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.iconOuter}>
              <LinearGradient colors={['#6B5DF6', '#5243F0']} style={styles.iconGradient}>
                <Ionicons name="school" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.titleSmall}>Welcome to</Text>
            <Text style={styles.titleLarge}>Sairam Hub</Text>
            <Text style={styles.subtitle}>{isLogin ? 'Verify your details to log in' : 'Let\'s personalize your learning experience'}</Text>
          </Animated.View>

          <Animated.View style={[styles.formSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputContainer, focusedInput === 'name' && styles.inputContainerFocused]}>
                <Ionicons name="person-outline" size={20} color={focusedInput === 'name' ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputContainerFocused]}>
                  <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="student@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={[styles.inputContainer, focusedInput === 'mobile' && styles.inputContainerFocused]}>
                <Ionicons name="call-outline" size={20} color={focusedInput === 'mobile' ? '#6B5DF6' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10 digit number"
                  placeholderTextColor="#94A3B8"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('mobile')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {!isLogin && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Department</Text>
                  <View style={styles.chipContainer}>
                    {DEPARTMENTS.map(dept => {
                      const isActive = department === dept;
                      return (
                        <TouchableOpacity
                          key={dept}
                          style={[styles.chip, isActive && styles.chipActive]}
                          onPress={() => setDepartment(dept)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{dept}</Text>
                          {isActive && <Ionicons name="checkmark-circle" size={18} color="#6B5DF6" style={styles.chipIcon} />}
                        </TouchableOpacity>
                      );
                    })}
                    
                    {/* Other Chip */}
                    <TouchableOpacity
                      style={[styles.chip, department === 'Other' && styles.chipActive]}
                      onPress={() => setDepartment('Other')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pencil-outline" size={16} color={department === 'Other' ? '#6B5DF6' : '#64748B'} style={{marginRight: 6}} />
                      <Text style={[styles.chipText, department === 'Other' && styles.chipTextActive]}>Other</Text>
                    </TouchableOpacity>
                  </View>

                  {department === 'Other' && (
                    <View style={[styles.inputContainer, { marginTop: 12 }, focusedInput === 'customDept' && styles.inputContainerFocused]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your department"
                        placeholderTextColor="#94A3B8"
                        value={customDept}
                        onChangeText={setCustomDept}
                        onFocus={() => setFocusedInput('customDept')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Year of Study</Text>
                  <View style={styles.chipContainer}>
                    {YEARS.map(y => {
                      const isActive = year === y;
                      return (
                        <TouchableOpacity
                          key={y}
                          style={[styles.chip, isActive && styles.chipActive]}
                          onPress={() => setYear(y)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{y}</Text>
                          {isActive && <Ionicons name="checkmark-circle" size={18} color="#6B5DF6" style={styles.chipIcon} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            {/* Toggle Button */}
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#6B5DF6', fontWeight: '600', fontSize: 15 }}>
                {isLogin ? "Don't have an account? Register" : 'Already registered? Verify & Login'}
              </Text>
            </TouchableOpacity>

            {/* Security Banner */}
            <View style={styles.securityBanner}>
              <View style={styles.securityIconBox}>
                <Ionicons name="shield-checkmark" size={20} color="#6B5DF6" />
              </View>
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityText}>Your information is secure and</Text>
                <Text style={styles.securityTextBold}>never shared <Text style={styles.securityText}>with anyone.</Text></Text>
              </View>
              <Ionicons name="lock-closed-outline" size={20} color="#CBD5E1" />
            </View>

            <TouchableOpacity 
              style={styles.buttonContainer} 
              onPress={handleContinue}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <LinearGradient 
                colors={['#7262F8', '#5444F2']} 
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{isSubmitting ? (isLogin ? 'Verifying...' : 'Setting up...') : (isLogin ? 'Verify & Login' : 'Continue')}</Text>
                {!isSubmitting && <Ionicons name={isLogin ? 'log-in-outline' : 'arrow-forward'} size={24} color="#fff" />}
              </LinearGradient>
            </TouchableOpacity>

          </Animated.View>
          
          <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
             <Ionicons name="checkmark-shield" size={14} color="#6B5DF6" />
             <Text style={styles.footerText}>Trusted by students across Sri Sairam Institutions</Text>
          </Animated.View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconOuter: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 50,
    marginBottom: 16,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B5DF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  titleSmall: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: -4,
  },
  titleLarge: {
    fontSize: 42,
    fontWeight: '800',
    color: '#5C4EF2',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCFDFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
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
    fontSize: 15,
    color: '#1E293B',
    height: '100%',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#F5F5FF',
    borderColor: '#6B5DF6',
  },
  chipText: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#6B5DF6',
    fontWeight: '700',
  },
  chipIcon: {
    marginLeft: 6,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  securityIconBox: {
    backgroundColor: '#EEF0FF',
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  securityTextBold: {
    fontSize: 13,
    color: '#6B5DF6',
    fontWeight: '700',
    lineHeight: 18,
  },
  buttonContainer: {
    borderRadius: 14,
    shadowColor: '#5C4EF2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  }
});
