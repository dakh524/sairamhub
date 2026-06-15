import React, { useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, Animated } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  const player = useAudioPlayer(require('../assets/sounds/startup.wav'));

  // Animated values
  const logoScale = useRef(new Animated.Value(0.1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepareAndAnimate() {
      await SplashScreen.hideAsync().catch(() => {});

      // Play sound
      setTimeout(() => {
        try {
          player.play();
        } catch (e) {
          console.warn('Sound failed to play:', e);
        }
      }, 100);

      // Run animations
      Animated.parallel([
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.spring(logoScale, {
              toValue: 1.2,
              friction: 4,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            })
          ])
        ]),
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ]),
        Animated.sequence([
          Animated.delay(2000),
          Animated.timing(screenOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          })
        ])
      ]).start((result) => {
        if (result.finished) {
          onFinish();
        }
      });
    }

    prepareAndAnimate();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Animated.Image source={require('../assets/images/app_logo.png')} style={styles.logoImage} resizeMode="contain" />
      </Animated.View>
      <Animated.Text style={[styles.tagline, { opacity: textOpacity }]}>Learn • Share • Succeed</Animated.Text>
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
