import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import ConfettiCannon from 'react-native-confetti-cannon';

interface Exam {
  id: string;
  name: string;
  dateStr: string; // YYYY-MM-DD
  timestamp: number;
}

export default function ExamCountdownScreen() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  // Time state for live updates
  const [now, setNow] = useState(Date.now());

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState(''); // Expected YYYY-MM-DD

  const confettiRef = React.useRef<ConfettiCannon>(null);

  // Load from local storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('exam_countdowns');
        if (storedData) {
          setExams(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Failed to load Exam data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save to local storage whenever exams change
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('exam_countdowns', JSON.stringify(exams));
    }
  }, [exams, loading]);

  // Live Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddExam = () => {
    if (!newName.trim() || !newDate.trim()) {
      Alert.alert('Error', 'Please enter both exam name and date.');
      return;
    }
    
    // Validate date format
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(newDate)) {
      Alert.alert('Invalid Date Format', 'Please use YYYY-MM-DD (e.g., 2026-06-20)');
      return;
    }

    // Parse date, set time to 9:00 AM local time for exam start
    const [year, month, day] = newDate.split('-').map(Number);
    const examDate = new Date(year, month - 1, day, 9, 0, 0);
    
    if (examDate.getTime() < Date.now()) {
      Alert.alert('Past Date', 'The exam date must be in the future!');
      return;
    }

    const newExam: Exam = {
      id: Date.now().toString(),
      name: newName.trim(),
      dateStr: newDate,
      timestamp: examDate.getTime(),
    };

    setExams([...exams, newExam]);
    setNewName('');
    setNewDate('');
    setIsModalVisible(false);
  };

  const deleteExam = (id: string) => {
    Alert.alert('Delete Exam', 'Remove this countdown?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setExams(exams.filter(e => e.id !== id)) }
    ]);
  };

  // Logic to find nearest exam
  const futureExams = exams.filter(e => e.timestamp > now).sort((a, b) => a.timestamp - b.timestamp);
  const pastExams = exams.filter(e => e.timestamp <= now).sort((a, b) => b.timestamp - a.timestamp);
  const nearestExam = futureExams.length > 0 ? futureExams[0] : null;

  const getRemainingTime = (targetTime: number) => {
    const diff = targetTime - now;
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    
    return { d, h, m, s };
  };

  if (loading) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ConfettiCannon
        count={80}
        origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
        autoStart={false}
        ref={confettiRef as any}
        fadeOut={true}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam Countdown</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HERO TIMER CARD */}
        {nearestExam ? (
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <Ionicons name="school" size={24} color={COLORS.white} />
              <Text style={styles.heroExamName} numberOfLines={1}>{nearestExam.name}</Text>
            </View>
            <Text style={styles.heroTargetDate}>Scheduled for {nearestExam.dateStr} at 9:00 AM</Text>
            
            <View style={styles.timerRow}>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{getRemainingTime(nearestExam.timestamp).d}</Text>
                <Text style={styles.timerLabel}>Days</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{getRemainingTime(nearestExam.timestamp).h.toString().padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Hours</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{getRemainingTime(nearestExam.timestamp).m.toString().padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Mins</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{getRemainingTime(nearestExam.timestamp).s.toString().padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Secs</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.heroCard, { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }]}>
            <Ionicons name="calendar-clear-outline" size={48} color="rgba(255,255,255,0.8)" />
            <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>No Upcoming Exams</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>You're all clear! Enjoy your free time.</Text>
            <TouchableOpacity style={styles.heroAddBtn} onPress={() => setIsModalVisible(true)}>
              <Text style={styles.heroAddBtnText}>+ Add Exam</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* UPCOMING EXAMS LIST */}
        {futureExams.length > 1 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Other Upcoming</Text>
            {futureExams.slice(1).map(exam => (
              <View key={exam.id} style={styles.listCard}>
                <View style={styles.listCardLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="time-outline" size={20} color={COLORS.secondary} />
                  </View>
                  <View>
                    <Text style={styles.listExamName}>{exam.name}</Text>
                    <Text style={styles.listExamDate}>{exam.dateStr}</Text>
                  </View>
                </View>
                <View style={styles.listCardRight}>
                  <Text style={styles.listDaysLeft}>{getRemainingTime(exam.timestamp).d} days</Text>
                  <TouchableOpacity onPress={() => deleteExam(exam.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* COMPLETED EXAMS LIST */}
        {pastExams.length > 0 && (
          <View style={[styles.sectionContainer, { marginTop: 30, opacity: 0.7 }]}>
            <Text style={styles.sectionTitle}>Completed Exams</Text>
            {pastExams.map(exam => (
              <View key={exam.id} style={[styles.listCard, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}>
                <View style={styles.listCardLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="checkmark-done" size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text style={[styles.listExamName, { color: COLORS.textSecondary, textDecorationLine: 'line-through' }]}>{exam.name}</Text>
                    <Text style={styles.listExamDate}>Finished on {exam.dateStr}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteExam(exam.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* ADD EXAM MODAL */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Exam</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Exam/Subject Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Data Structures Final"
                placeholderTextColor={COLORS.textSecondary}
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Exam Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 2026-07-15"
                placeholderTextColor={COLORS.textSecondary}
                value={newDate}
                onChangeText={setNewDate}
                keyboardType="numeric"
              />
              <Text style={styles.hintText}>Exam starts at 9:00 AM on this date.</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddExam}>
              <Text style={styles.saveBtnText}>Save Exam</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

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
  addButton: {
    padding: 8,
  },
  heroCard: {
    backgroundColor: COLORS.secondary,
    margin: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroExamName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 12,
    flex: 1,
  },
  heroTargetDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
    marginLeft: 36,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  timerBlock: {
    alignItems: 'center',
    width: 60,
  },
  timerNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  timerColon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 16,
  },
  heroAddBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  heroAddBtnText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  listExamName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  listExamDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  listCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDaysLeft: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginRight: 16,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
