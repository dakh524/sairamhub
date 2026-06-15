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
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withRepeat,
  Easing
} from 'react-native-reanimated';

export default function CoinFlipScreen() {
  const router = useRouter();
  
  const [result, setResult] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  
  const rotation = useSharedValue(0);

  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setResult(null);

    // Randomize outcome: 0 for Heads, 1 for Tails
    const isHeads = Math.random() > 0.5;
    
    // Animate: spin 5 full times (5 * 360 = 1800) + extra 180 if tails
    const targetRotation = rotation.value + 1800 + (isHeads ? 0 : 180);

    rotation.value = withSequence(
      // Wind up
      withTiming(rotation.value - 45, { duration: 300, easing: Easing.out(Easing.ease) }),
      // Fast flips
      withTiming(targetRotation, { duration: 2000, easing: Easing.inOut(Easing.ease) }, (finished) => {
        if (finished) {
          // Callback after animation
        }
      })
    );

    // Set result right after animation ends
    setTimeout(() => {
      setResult(isHeads ? 'HEADS' : 'TAILS');
      setIsFlipping(false);
    }, 2400);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotateX: `${rotation.value}deg` }
      ],
    };
  });

  // Calculate which side is showing based on current rotation to show Heads or Tails face
  // This is a simple trick: if we rotate around X, when angle is between 90 and 270 (mod 360), back is visible.
  const animatedFrontStyle = useAnimatedStyle(() => {
    const r = rotation.value % 360;
    const isBack = r > 90 && r < 270;
    return {
      opacity: isBack ? 0 : 1,
    };
  });

  const animatedBackStyle = useAnimatedStyle(() => {
    const r = rotation.value % 360;
    const isBack = r > 90 && r < 270;
    return {
      opacity: isBack ? 1 : 0,
      transform: [{ rotateX: '180deg' }] // Keep text upright on the back
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
          <Animated.View style={[styles.coin, animatedStyle]}>
            {/* FRONT (HEADS) */}
            <Animated.View style={[styles.coinFace, styles.coinFront, animatedFrontStyle]}>
              <Text style={styles.coinText}>HEADS</Text>
            </Animated.View>

            {/* BACK (TAILS) */}
            <Animated.View style={[styles.coinFace, styles.coinBack, animatedBackStyle]}>
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
    perspective: 1000,
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
