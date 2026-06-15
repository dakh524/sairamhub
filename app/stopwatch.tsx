import React, { useState, useEffect, useRef } from 'react';
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

export default function StopwatchScreen() {
  const router = useRouter();

  const [time, setTime] = useState(0); // Time in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  
  const timerRef = useRef<any | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - accumulatedTimeRef.current;
      timerRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10); // Update every 10ms for smooth UI
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      accumulatedTimeRef.current = time;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    accumulatedTimeRef.current = 0;
  };

  const handleLap = () => {
    setLaps([time, ...laps]);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      m: minutes.toString().padStart(2, '0'),
      s: seconds.toString().padStart(2, '0'),
      ms: milliseconds.toString().padStart(2, '0'),
    };
  };

  const { m, s, ms } = formatTime(time);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stopwatch</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        
        {/* TIMER DISPLAY */}
        <View style={styles.timerCircle}>
          <View style={styles.timerInnerCircle}>
            <Text style={[styles.timerText, { fontVariant: ['tabular-nums'] }]}>
              {m}:{s}<Text style={styles.msText}>.{ms}</Text>
            </Text>
          </View>
        </View>

        {/* CONTROLS */}
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={[styles.controlBtn, { backgroundColor: '#F1F5F9' }]} 
            onPress={isRunning ? handleLap : handleReset}
          >
            <Ionicons name={isRunning ? "flag" : "refresh"} size={28} color={COLORS.textSecondary} />
            <Text style={[styles.controlBtnText, { color: COLORS.textSecondary }]}>
              {isRunning ? 'Lap' : 'Reset'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.playPauseBtn, { backgroundColor: isRunning ? '#EF4444' : '#3B82F6' }]} 
            onPress={handleStartPause}
          >
            <Ionicons name={isRunning ? "pause" : "play"} size={40} color={COLORS.white} style={{ marginLeft: isRunning ? 0 : 4 }} />
          </TouchableOpacity>

          <View style={{ width: 80 }} /> {/* Placeholder to balance the row */}
        </View>

        {/* LAPS */}
        <View style={styles.lapsContainer}>
          {laps.map((lapTime, index) => {
            const formatted = formatTime(lapTime);
            return (
              <View key={index} style={styles.lapRow}>
                <Text style={styles.lapIndex}>Lap {laps.length - index}</Text>
                <Text style={[styles.lapTime, { fontVariant: ['tabular-nums'] }]}>
                  {formatted.m}:{formatted.s}.{formatted.ms}
                </Text>
              </View>
            );
          })}
        </View>
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
    paddingTop: 40,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  timerInnerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200',
    color: COLORS.text,
    letterSpacing: 2,
  },
  msText: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.textSecondary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  controlBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  playPauseBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  lapsContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  lapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lapIndex: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  lapTime: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '500',
  },
});
