import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  runOnJS,
  withSpring
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  // Shared values
  const logoScale = useSharedValue(0.1);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    async function prepareAndAnimate() {
      let soundObject: Audio.Sound | null = null;
      try {
        const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/startup.wav'));
        soundObject = sound;
      } catch (audioErr) {
        console.warn('Audio failed to load:', audioErr);
      }

      await SplashScreen.hideAsync();

      // --- Simple Logo Pulse ---
      // Logo springs in at 100ms
      logoOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
      logoScale.value = withDelay(100, withSpring(1.2, { damping: 10, stiffness: 100, mass: 1 }));

      if (soundObject) {
        setTimeout(async () => {
          try {
            await soundObject?.playAsync();
          } catch (e) {}
        }, 100);
      }

      // Text fades in at 600ms
      textOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

      // Fade out entirely at 2000ms (keeps it under 2.5 seconds total)
      screenOpacity.value = withDelay(2000, withTiming(0, { duration: 400 }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }));

      if (soundObject) {
        setTimeout(() => soundObject?.unloadAsync(), 3000);
      }
    }
    prepareAndAnimate();
  }, []);

  // Animated Styles
  const bgStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value, transform: [{ scale: logoScale.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  return (
    <Animated.View style={[styles.container, bgStyle]}>
      {/* Just the Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Animated.Image source={require('../assets/images/app_logo.png')} style={styles.logoImage} resizeMode="contain" />
      </Animated.View>

      <Animated.Text style={[styles.tagline, textStyle]}>Learn • Share • Succeed</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoContainer: {
    width: width * 0.8, 
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  tagline: {
    position: 'absolute',
    bottom: height * 0.15,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 4,
    textTransform: 'uppercase',
  }
});
