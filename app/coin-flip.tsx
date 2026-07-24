import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function CoinFlipScreen() {
  const router = useRouter();
  
  const [result, setResult] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  
  const rotation = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setResult(null);

    // Randomize outcome: 0 for Heads, 1 for Tails
    const isHeads = Math.random() > 0.5;
    
    // Animate: spin 5 full times (5 * 360 = 1800) + extra 180 if tails
    const targetRotation = currentRotation.current + 1800 + (isHeads ? 0 : 180);

    Animated.sequence([
      // Wind up
      Animated.timing(rotation, {
        toValue: currentRotation.current - 45,
        duration: 300,
        useNativeDriver: true,
      }),
      // Fast flips
      Animated.timing(rotation, {
        toValue: targetRotation,
        duration: 2000,
        useNativeDriver: true,
      })
    ]).start(() => {
      currentRotation.current = targetRotation;
    });

    // Set result right after animation ends
    setTimeout(() => {
      setResult(isHeads ? 'HEADS' : 'TAILS');
      setIsFlipping(false);
    }, 2400);
  };

  // Interpolate rotation for rotateX style
  const rotateX = rotation.interpolate({
    inputRange: [0, 360000],
    outputRange: ['0deg', '360000deg']
  });

  // Calculate front and back visibility dynamically based on rotation
  const frontOpacity = rotation.interpolate({
    inputRange: (() => {
      const range = [];
      for (let i = 0; i <= 1000; i++) {
        const base = i * 360;
        range.push(base, base + 90, base + 270, base + 360);
      }
      return range;
    })(),
    outputRange: (() => {
      const range = [];
      for (let i = 0; i <= 1000; i++) {
        range.push(1, 0, 0, 1);
      }
      return range;
    })(),
    extrapolate: 'clamp'
  });

  const backOpacity = rotation.interpolate({
    inputRange: (() => {
      const range = [];
      for (let i = 0; i <= 1000; i++) {
        const base = i * 360;
        range.push(base, base + 90, base + 270, base + 360);
      }
      return range;
    })(),
    outputRange: (() => {
      const range = [];
      for (let i = 0; i <= 1000; i++) {
        range.push(0, 1, 1, 0);
      }
      return range;
    })(),
    extrapolate: 'clamp'
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Heads or Tails 🪙</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        
        {/* COIN CONTAINER */}
        <TouchableOpacity 
          style={styles.coinWrapper} 
          onPress={flipCoin}
          activeOpacity={1}
          disabled={isFlipping}
        >
          <Animated.View style={[styles.coin, { transform: [{ rotateX }] }]}>
            {/* FRONT (HEADS) */}
            <Animated.View style={[styles.coinFace, styles.coinFront, { opacity: frontOpacity }]}>
              <Text style={styles.coinText}>HEADS</Text>
            </Animated.View>

            {/* BACK (TAILS) */}
            <Animated.View style={[styles.coinFace, styles.coinBack, { opacity: backOpacity, transform: [{ rotateX: '180deg' }] }]}>
              <Text style={styles.coinText}>TAILS</Text>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>

        {/* RESULT TEXT */}
        <View style={styles.resultBox}>
          {isFlipping ? (
            <Text style={styles.flippingText}>Flipping...</Text>
          ) : result ? (
            <Text style={styles.resultText}>It's {result}!</Text>
          ) : (
            <Text style={styles.instructionText}>Tap the coin to flip</Text>
          )}
        </View>

        {/* BUTTON */}
        <TouchableOpacity 
          style={[styles.flipBtn, isFlipping && { opacity: 0.5 }]} 
          onPress={flipCoin}
          disabled={isFlipping}
        >
          <Text style={styles.flipBtnText}>FLIP COIN</Text>
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
    paddingBottom: 50,
  },
  coinWrapper: {
    width: 250,
    height: 250,
    marginBottom: 60,
    perspective: 1000 as any,
  },
  coin: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  coinFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 125,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 12,
    backfaceVisibility: 'hidden',
  },
  coinFront: {
    backgroundColor: '#FCD34D', // Gold
    borderColor: '#F59E0B',
  },
  coinBack: {
    backgroundColor: '#D1D5DB', // Silver
    borderColor: '#9CA3AF',
  },
  coinText: {
    fontSize: 42,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.6)',
  },
  resultBox: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  flippingText: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
  },
  instructionText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  flipBtn: {
    backgroundColor: COLORS.text,
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  flipBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
