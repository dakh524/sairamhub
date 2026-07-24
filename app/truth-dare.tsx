import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const TRUTHS = [
  "What is your most embarrassing moment in college so far?",
  "Who was your first crush?",
  "What is the biggest lie you've ever told to get out of class?",
  "If you had to swap lives with a classmate for a day, who would it be?",
  "What's a secret you've never told anyone here?",
  "Have you ever slept through an important exam?",
  "What's the weirdest thing you've ever searched on your phone?",
  "If you had to delete one app from your phone permanently, what would it be?",
  "Who in this room do you think would survive the longest in a zombie apocalypse?",
  "What's the most trouble you've ever gotten into at school?",
];

const DARES = [
  "Do your best impression of our toughest professor.",
  "Let the person next to you send one text to anyone in your contacts.",
  "Sing the chorus of your favorite song loudly.",
  "Do 10 pushups right now.",
  "Talk in a British accent until your next turn.",
  "Let the group look through your phone's photo gallery for 30 seconds.",
  "Dance with no music for 1 minute.",
  "Call a random contact and try to sell them a pen.",
  "Eat a spoonful of whatever condiment the group chooses.",
  "Act like a monkey until someone guesses what you are.",
];

export default function TruthDareScreen() {
  const router = useRouter();
  
  const [resultType, setResultType] = useState<'TRUTH' | 'DARE' | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const generateRandom = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResultType(null);
    setPrompt(null);

    // Fake loading for suspense
    let count = 0;
    const interval = setInterval(() => {
      setResultType(Math.random() > 0.5 ? 'TRUTH' : 'DARE');
      count++;
      if (count > 10) {
        clearInterval(interval);
        
        // Final choice
        const isTruth = Math.random() > 0.5;
        setResultType(isTruth ? 'TRUTH' : 'DARE');
        
        // Pick random prompt
        const list = isTruth ? TRUTHS : DARES;
        setPrompt(list[Math.floor(Math.random() * list.length)]);
        
        setIsSpinning(false);
      }
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Truth or Dare</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        
        {/* RESULT CARD */}
        <View style={[
          styles.resultCard, 
          resultType === 'TRUTH' ? { backgroundColor: '#3B82F6' } : resultType === 'DARE' ? { backgroundColor: '#EF4444' } : { backgroundColor: '#F3F4F6' }
        ]}>
          {isSpinning ? (
            <Text style={styles.spinningText}>Choosing...</Text>
          ) : prompt ? (
            <>
              <Text style={styles.typeText}>{resultType}</Text>
              <Text style={styles.promptText}>{prompt}</Text>
            </>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="help-circle-outline" size={64} color="#9CA3AF" />
              <Text style={{ color: '#9CA3AF', fontSize: 16, marginTop: 10 }}>Press the button to play</Text>
            </View>
          )}
        </View>

        {/* BUTTON */}
        <TouchableOpacity 
          style={[styles.playBtn, isSpinning && { opacity: 0.5 }]} 
          onPress={generateRandom}
          disabled={isSpinning}
        >
          <Ionicons name="shuffle" size={32} color={COLORS.white} />
          <Text style={styles.playBtnText}>SPIN THE BOTTLE</Text>
        </TouchableOpacity>

      </View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 50,
  },
  resultCard: {
    width: '100%',
    minHeight: 300,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  spinningText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    fontStyle: 'italic',
  },
  typeText: {
    fontSize: 48,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
    position: 'absolute',
    top: 20,
    textTransform: 'uppercase',
  },
  promptText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 34,
  },
  playBtn: {
    backgroundColor: '#8B5CF6',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 8,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  playBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
