import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function AgeCalculatorScreen() {
  const router = useRouter();
  
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  
  const [age, setAge] = useState<{ years: number; months: number; days: number } | null>(null);
  const [totalDays, setTotalDays] = useState<number | null>(null);
  const [nextBday, setNextBday] = useState<{ months: number; days: number } | null>(null);
  const [error, setError] = useState('');

  const calculateAge = () => {
    Keyboard.dismiss();
    setError('');

    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (!d || !m || !y) {
      setError('Please fill in all fields completely.');
      return;
    }

    if (y < 1900 || y > new Date().getFullYear()) {
      setError('Please enter a valid year.');
      return;
    }

    if (m < 1 || m > 12) {
      setError('Month must be between 1 and 12.');
      return;
    }

    // Days in month logic
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d < 1 || d > daysInMonth) {
      setError(`Invalid day! Month ${m} only has ${daysInMonth} days.`);
      return;
    }

    const birthDate = new Date(y, m - 1, d);
    const today = new Date();

    if (birthDate > today) {
      setError('Date of birth cannot be in the future.');
      return;
    }

    // Exact Age Calculation
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      days += previousMonth;
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }

    setAge({ years, months, days });

    // Total Days
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    setTotalDays(diffDays);

    // Next Birthday
    let nextBdayDate = new Date(today.getFullYear(), m - 1, d);
    if (today > nextBdayDate) {
      nextBdayDate.setFullYear(today.getFullYear() + 1);
    }
    
    let bMonths = nextBdayDate.getMonth() - today.getMonth();
    let bDays = nextBdayDate.getDate() - today.getDate();
    
    if (bDays < 0) {
      bMonths--;
      const prevMonth = new Date(nextBdayDate.getFullYear(), nextBdayDate.getMonth(), 0).getDate();
      bDays += prevMonth;
    }
    if (bMonths < 0) {
      bMonths += 12;
    }
    
    setNextBday({ months: bMonths, days: bDays });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Age Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
          
          {/* INPUT CARD */}
          <View style={styles.inputCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={styles.iconCircle}>
                <Ionicons name="calendar-outline" size={20} color="#F97316" />
              </View>
              <Text style={styles.cardTitle}>Enter Date of Birth</Text>
            </View>

            <View style={styles.dateInputsRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Day</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="DD"
                  keyboardType="numeric"
                  maxLength={2}
                  value={day}
                  onChangeText={setDay}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Month</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                  value={month}
                  onChangeText={setMonth}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1.5 }]}>
                <Text style={styles.inputLabel}>Year</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY"
                  keyboardType="numeric"
                  maxLength={4}
                  value={year}
                  onChangeText={setYear}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.calcBtn} onPress={calculateAge}>
              <Text style={styles.calcBtnText}>Calculate</Text>
            </TouchableOpacity>
          </View>

          {/* RESULTS */}
          {age && (
            <View>
              {/* EXACT AGE HERO */}
              <View style={styles.resultHeroCard}>
                <Text style={styles.heroTitle}>Your Exact Age</Text>
                <View style={styles.heroValuesContainer}>
                  <View style={styles.heroValueBox}>
                    <Text style={styles.heroNumber}>{age.years}</Text>
                    <Text style={styles.heroLabel}>Years</Text>
                  </View>
                  <Text style={styles.heroSeparator}>:</Text>
                  <View style={styles.heroValueBox}>
                    <Text style={styles.heroNumber}>{age.months}</Text>
                    <Text style={styles.heroLabel}>Months</Text>
                  </View>
                  <Text style={styles.heroSeparator}>:</Text>
                  <View style={styles.heroValueBox}>
                    <Text style={styles.heroNumber}>{age.days}</Text>
                    <Text style={styles.heroLabel}>Days</Text>
                  </View>
                </View>
              </View>

              {/* STATS */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                
                {/* NEXT BIRTHDAY */}
                {nextBday && (
                  <View style={[styles.statCard, { flex: 1, marginRight: 8, backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="gift-outline" size={16} color="#F97316" />
                      <Text style={[styles.statTitle, { color: '#C2410C', marginLeft: 6 }]}>Next Birthday</Text>
                    </View>
                    <Text style={[styles.statValue, { color: '#9A3412', fontSize: 16 }]}>
                      {nextBday.months} mos, {nextBday.days} days
                    </Text>
                  </View>
                )}

                {/* TOTAL DAYS */}
                {totalDays !== null && (
                  <View style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="sunny-outline" size={16} color="#3B82F6" />
                      <Text style={[styles.statTitle, { marginLeft: 6 }]}>Total Days Alive</Text>
                    </View>
                    <Text style={styles.statValue}>
                      {totalDays.toLocaleString()}
                    </Text>
                  </View>
                )}
                
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  dateInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  dateInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 12,
    fontWeight: '500',
  },
  calcBtn: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  calcBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  resultHeroCard: {
    backgroundColor: '#F97316',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  heroTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  heroValuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroValueBox: {
    alignItems: 'center',
    width: 70,
  },
  heroNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.white,
  },
  heroLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: 4,
  },
  heroSeparator: {
    fontSize: 30,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
    marginHorizontal: 10,
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
