import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const GRADES = [
  { label: 'O', value: 10 },
  { label: 'A+', value: 9 },
  { label: 'A', value: 8 },
  { label: 'B+', value: 7 },
  { label: 'B', value: 6 },
  { label: 'C', value: 5 },
  { label: 'U', value: 0 },
];

interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: number | null; // Grade point value (10, 9, etc)
}

interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
}

export default function CGPACalculator() {
  const router = useRouter();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('cgpa_data');
        if (storedData) {
          setSemesters(JSON.parse(storedData));
        } else {
          // Initialize with 1 semester if empty
          setSemesters([
            {
              id: Date.now().toString(),
              name: 'Semester 1',
              subjects: [
                { id: Date.now().toString() + '1', name: 'Subject 1', credits: 3, grade: null },
                { id: Date.now().toString() + '2', name: 'Subject 2', credits: 3, grade: null },
              ],
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load CGPA data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save to local storage whenever semesters change
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('cgpa_data', JSON.stringify(semesters));
    }
  }, [semesters, loading]);

  const addSemester = () => {
    const newSem: Semester = {
      id: Date.now().toString(),
      name: `Semester ${semesters.length + 1}`,
      subjects: [{ id: Date.now().toString() + 's', name: 'Subject 1', credits: 3, grade: null }],
    };
    setSemesters([...semesters, newSem]);
  };

  const removeSemester = (semId: string) => {
    Alert.alert('Delete Semester', 'Are you sure you want to remove this semester and all its subjects?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setSemesters(semesters.filter(s => s.id !== semId)) }
    ]);
  };

  const addSubject = (semId: string) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        return {
          ...sem,
          subjects: [...sem.subjects, { id: Date.now().toString(), name: `Subject ${sem.subjects.length + 1}`, credits: 3, grade: null }]
        };
      }
      return sem;
    }));
  };

  const removeSubject = (semId: string, subId: string) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        return { ...sem, subjects: sem.subjects.filter(sub => sub.id !== subId) };
      }
      return sem;
    }));
  };

  const updateSubject = (semId: string, subId: string, field: keyof Subject, value: any) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        return {
          ...sem,
          subjects: sem.subjects.map(sub => {
            if (sub.id === subId) {
              return { ...sub, [field]: value };
            }
            return sub;
          })
        };
      }
      return sem;
    }));
  };

  const clearAllData = () => {
    Alert.alert('Reset All', 'Are you sure you want to delete all CGPA data? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => {
          setSemesters([{
            id: Date.now().toString(),
            name: 'Semester 1',
            subjects: [{ id: Date.now().toString() + '1', name: 'Subject 1', credits: 3, grade: null }],
          }]);
      }}
    ]);
  };

  // Calculations
  const calculateSGPA = (subjects: Subject[]) => {
    let totalCredits = 0;
    let earnedPoints = 0;
    subjects.forEach(sub => {
      if (sub.grade !== null && sub.credits > 0) {
        totalCredits += sub.credits;
        earnedPoints += (sub.grade * sub.credits);
      }
    });
    return totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : '0.00';
  };

  const calculateCGPA = () => {
    let totalCredits = 0;
    let earnedPoints = 0;
    semesters.forEach(sem => {
      sem.subjects.forEach(sub => {
        if (sub.grade !== null && sub.credits > 0) {
          totalCredits += sub.credits;
          earnedPoints += (sub.grade * sub.credits);
        }
      });
    });
    return totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : '0.00';
  };

  const overallCGPA = calculateCGPA();
  const cgpaPercentage = (parseFloat(overallCGPA) * 10).toFixed(1);

  if (loading) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CGPA Calculator</Text>
        <TouchableOpacity onPress={clearAllData} style={styles.resetButton}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* CGPA DISPLAY CARD */}
        <View style={styles.cgpaCard}>
          <Text style={styles.cgpaTitle}>Cumulative GPA</Text>
          <View style={styles.cgpaCircle}>
            <Text style={styles.cgpaValue}>{overallCGPA}</Text>
            <Text style={styles.cgpaMax}>/ 10.0</Text>
          </View>
          <Text style={styles.cgpaPercentage}>{cgpaPercentage}% Equivalent</Text>
        </View>

        {/* SEMESTERS */}
        <View style={styles.semestersContainer}>
          {semesters.map((sem, index) => {
            const sgpa = calculateSGPA(sem.subjects);
            
            return (
              <View key={sem.id} style={styles.semesterBlock}>
                <View style={styles.semesterHeader}>
                  <TextInput
                    style={styles.semesterNameInput}
                    value={sem.name}
                    onChangeText={(text) => {
                      setSemesters(semesters.map(s => s.id === sem.id ? { ...s, name: text } : s));
                    }}
                  />
                  <View style={styles.semesterHeaderRight}>
                    <View style={styles.sgpaBadge}>
                      <Text style={styles.sgpaText}>SGPA: {sgpa}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeSemester(sem.id)} style={{ padding: 4 }}>
                      <Ionicons name="close-circle-outline" size={22} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* SUBJECTS HEADER */}
                <View style={styles.subjectTableHeader}>
                  <Text style={[styles.thText, { flex: 2 }]}>Subject</Text>
                  <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Credits</Text>
                  <Text style={[styles.thText, { flex: 1.5, textAlign: 'center' }]}>Grade</Text>
                  <View style={{ width: 30 }} />
                </View>

                {/* SUBJECTS LIST */}
                {sem.subjects.map((sub) => (
                  <View key={sub.id} style={styles.subjectRow}>
                    <TextInput
                      style={[styles.subjectInput, { flex: 2 }]}
                      value={sub.name}
                      placeholder="Subject Name"
                      placeholderTextColor="#999"
                      onChangeText={(text) => updateSubject(sem.id, sub.id, 'name', text)}
                    />
                    
                    <View style={styles.creditsSelector}>
                      <TouchableOpacity 
                        style={styles.creditBtn}
                        onPress={() => updateSubject(sem.id, sub.id, 'credits', Math.max(1, sub.credits - 1))}
                      >
                        <Ionicons name="remove" size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                      <Text style={styles.creditValue}>{sub.credits}</Text>
                      <TouchableOpacity 
                        style={styles.creditBtn}
                        onPress={() => updateSubject(sem.id, sub.id, 'credits', Math.min(8, sub.credits + 1))}
                      >
                        <Ionicons name="add" size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>

                    {/* GRADE SELECTOR */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradeScroll}>
                      {GRADES.map(g => (
                        <TouchableOpacity
                          key={g.label}
                          style={[
                            styles.gradeOption,
                            sub.grade === g.value && styles.gradeOptionSelected
                          ]}
                          onPress={() => updateSubject(sem.id, sub.id, 'grade', g.value)}
                        >
                          <Text style={[
                            styles.gradeOptionText,
                            sub.grade === g.value && styles.gradeOptionTextSelected
                          ]}>
                            {g.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity onPress={() => removeSubject(sem.id, sub.id)} style={styles.deleteSubBtn}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity style={styles.addSubjectBtn} onPress={() => addSubject(sem.id)}>
                  <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.addSubjectText}>Add Subject</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.addSemesterBtn} onPress={addSemester}>
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.addSemesterBtnText}>Add Semester</Text>
        </TouchableOpacity>

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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  resetButton: {
    padding: 5,
  },
  cgpaCard: {
    backgroundColor: COLORS.primary,
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cgpaTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  cgpaCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  cgpaValue: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: '900',
  },
  cgpaMax: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  cgpaPercentage: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  semestersContainer: {
    paddingHorizontal: 20,
  },
  semesterBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  semesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  semesterNameInput: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  semesterHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sgpaBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  sgpaText: {
    color: '#6B21A8',
    fontWeight: '700',
    fontSize: 14,
  },
  subjectTableHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  thText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 8,
  },
  subjectInput: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  creditsSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditBtn: {
    backgroundColor: '#E0E7FF',
    borderRadius: 4,
    padding: 2,
  },
  creditValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 8,
  },
  gradeScroll: {
    flex: 1.5,
  },
  gradeOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#F3F4F6',
  },
  gradeOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  gradeOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  gradeOptionTextSelected: {
    color: COLORS.white,
  },
  deleteSubBtn: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSubjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    marginTop: 8,
  },
  addSubjectText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  addSemesterBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.text,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addSemesterBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
