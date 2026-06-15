import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { fetchAllMaterials } from '../helpers/sheets';

export default function SubjectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sem = params.sem as string;
  const dept = params.dept as string;
  const resourceType = params.type as string; // Quick access type filter

  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const allMaterials = await fetchAllMaterials();
        
        // Filter materials matching dept and sem, then extract unique subjects
        const filtered = allMaterials.filter(
          (m) =>
            (m.dept.toUpperCase() === dept.toUpperCase() || m.dept.toUpperCase() === 'COMMON' || m.dept.toUpperCase() === 'ALL') &&
            String(m.sem) === String(sem)
        );
        
        const uniqueSubjects = Array.from(
          new Set(filtered.map((m) => m.subject))
        ).filter(Boolean);
        
        setSubjects(uniqueSubjects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, [dept, sem]);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sem {sem} › {dept}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Select Subject</Text>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching subjects...</Text>
          </View>
        ) : subjects.length === 0 ? (
          <View style={styles.loaderContainer}>
            <Text style={styles.loadingText}>No subjects synced from database yet.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {subjects.map((sub, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/resources',
                    params: { sem, dept, subject: sub, type: resourceType || '' },
                  })
                }
              >
                <View style={styles.cardLeft}>
                  <Ionicons name="book-outline" size={20} color={COLORS.primary} style={styles.bookIcon} />
                  <Text style={styles.subjectText}>{sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookIcon: {
    marginRight: 12,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
});
