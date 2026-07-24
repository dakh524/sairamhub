import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const FLAMES_DICT = {
  F: { title: 'Friends', icon: 'people', color: '#3B82F6', desc: 'You guys are going to be great friends!' },
  L: { title: 'Lovers', icon: 'heart', color: '#EF4444', desc: 'Love is in the air! ❤️' },
  A: { title: 'Affection', icon: 'happy', color: '#F59E0B', desc: 'There is a lot of affection between you two.' },
  M: { title: 'Marriage', icon: 'diamond', color: '#8B5CF6', desc: 'Wedding bells are ringing! 💍' },
  E: { title: 'Enemies', icon: 'skull', color: '#111827', desc: 'Uh oh... keep your distance! ⚔️' },
  S: { title: 'Siblings', icon: 'home', color: '#10B981', desc: 'Like brother and sister.' },
};

export default function FlamesScreen() {
  const router = useRouter();
  
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  
  const [resultKey, setResultKey] = useState<keyof typeof FLAMES_DICT | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateFlames = () => {
    Keyboard.dismiss();
    if (!name1.trim() || !name2.trim()) return;

    setIsCalculating(true);
    setResultKey(null);

    setTimeout(() => {
      let n1 = name1.toLowerCase().replace(/[^a-z]/g, '').split('');
      let n2 = name2.toLowerCase().replace(/[^a-z]/g, '').split('');

      // Cross out common letters
      for (let i = 0; i < n1.length; i++) {
        for (let j = 0; j < n2.length; j++) {
          if (n1[i] === n2[j]) {
            n1[i] = '*';
            n2[j] = '*';
            break;
          }
        }
      }

      // Count remaining letters
      const remainingCount = n1.filter(c => c !== '*').length + n2.filter(c => c !== '*').length;

      // FLAMES logic
      let flames = ['F', 'L', 'A', 'M', 'E', 'S'];
      let index = 0;

      while (flames.length > 1) {
        index = (index + remainingCount - 1) % flames.length;
        flames.splice(index, 1);
      }

      setResultKey(flames[0] as keyof typeof FLAMES_DICT);
      setIsCalculating(false);
    }, 1500); // 1.5s delay for suspense
  };

  const reset = () => {
    setName1('');
    setName2('');
    setResultKey(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FLAMES Calculator</Text>
        <TouchableOpacity onPress={reset} style={{ padding: 8 }}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Text style={styles.flamesLetter}>F<Text style={{color:'#EF4444'}}>L</Text>A<Text style={{color:'#8B5CF6'}}>M</Text>E<Text style={{color:'#10B981'}}>S</Text></Text>
          <Text style={styles.subtitle}>Find out your relationship status!</Text>
        </View>

        {/* INPUTS */}
        <View style={styles.inputCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name1}
              onChangeText={setName1}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View style={styles.heartIcon}>
            <Ionicons name="heart" size={30} color="#EF4444" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Their Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter their name"
              value={name2}
              onChangeText={setName2}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity 
            style={[styles.calcBtn, (!name1 || !name2 || isCalculating) && { opacity: 0.5 }]} 
            onPress={calculateFlames}
            disabled={!name1 || !name2 || isCalculating}
          >
            <Text style={styles.calcBtnText}>
              {isCalculating ? 'Calculating...' : 'Find Match!'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RESULT */}
        {resultKey && !isCalculating && (
          <View style={[styles.resultCard, { backgroundColor: FLAMES_DICT[resultKey].color }]}>
            <Ionicons name={FLAMES_DICT[resultKey].icon as any} size={64} color={COLORS.white} />
            <Text style={styles.resultTitle}>{FLAMES_DICT[resultKey].title}</Text>
            <Text style={styles.resultDesc}>{FLAMES_DICT[resultKey].desc}</Text>
          </View>
        )}

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
  content: {
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  flamesLetter: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  inputCard: {
    backgroundColor: COLORS.white,
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  heartIcon: {
    alignItems: 'center',
    marginVertical: -10,
    zIndex: 10,
  },
  calcBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  calcBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    width: '100%',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  resultDesc: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
});
