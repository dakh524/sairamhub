import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function LuckyDrawScreen() {
  const router = useRouter();
  const [names, setNames] = useState<string[]>([]);
  const [inputName, setInputName] = useState('');
  
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const confettiRef = useRef<ConfettiCannon>(null);

  const addName = () => {
    if (inputName.trim() !== '') {
      setNames([...names, inputName.trim()]);
      setInputName('');
    }
  };

  const removeName = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const pickWinner = () => {
    if (names.length < 2) return;
    Keyboard.dismiss();
    setWinner(null);
    setIsSpinning(true);

    let count = 0;
    const maxSpins = 20;
    const interval = setInterval(() => {
      setWinner(names[Math.floor(Math.random() * names.length)]);
      count++;
      if (count > maxSpins) {
        clearInterval(interval);
        setIsSpinning(false);
        const finalWinner = names[Math.floor(Math.random() * names.length)];
        setWinner(finalWinner);
        if (confettiRef.current) {
          confettiRef.current.start();
        }
      }
    }, 100);
  };

  const reset = () => {
    setWinner(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ConfettiCannon
        count={150}
        origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
        autoStart={false}
        ref={confettiRef as any}
        fadeOut={true}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lucky Draw 🎁</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        {/* WINNER DISPLAY */}
        <View style={styles.winnerCard}>
          <Text style={styles.winnerTitle}>Winner</Text>
          <View style={styles.winnerBox}>
            <Text style={[styles.winnerText, isSpinning && { color: COLORS.textSecondary, fontSize: 24 }]}>
              {winner ? winner : (names.length < 2 ? 'Add at least 2 names' : 'Ready to draw')}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.drawBtn, (names.length < 2 || isSpinning) && { opacity: 0.5 }]} 
            onPress={winner && !isSpinning ? reset : pickWinner}
            disabled={names.length < 2 || isSpinning}
          >
            <Text style={styles.drawBtnText}>
              {isSpinning ? 'Picking...' : winner ? 'Reset Winner' : 'Pick Winner!'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ADD NAMES */}
        <Text style={styles.sectionTitle}>Participants ({names.length})</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter a name..."
            placeholderTextColor="#9CA3AF"
            value={inputName}
            onChangeText={setInputName}
            onSubmitEditing={addName}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addName}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* NAME LIST */}
        <View style={styles.listContainer}>
          {names.map((name, index) => (
            <View key={index} style={styles.nameRow}>
              <View style={styles.nameLeft}>
                <View style={styles.bullet} />
                <Text style={styles.nameText}>{name}</Text>
              </View>
              <TouchableOpacity onPress={() => removeName(index)} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          {names.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 20 }}>List is empty</Text>
          )}
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
  winnerCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  winnerTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  winnerBox: {
    backgroundColor: COLORS.white,
    width: '100%',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    marginBottom: 20,
  },
  winnerText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  drawBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  drawBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  nameLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  nameText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
});
