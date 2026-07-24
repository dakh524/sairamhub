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
import { fetchAllMaterials } from '../helpers/api';
import { Material } from '../types/material';

export default function ResourcesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sem = params.sem as string;
  const dept = params.dept as string;
  const subject = params.subject as string;

  const [loading, setLoading] = useState<boolean>(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [subjectMaterials, setSubjectMaterials] = useState<Material[]>([]);

  const categoryConfig: Record<string, {icon: string, color: string}> = {
    'Notes': { icon: 'document-text-outline', color: '#3B82F6' },
    'Study Materials': { icon: 'book-outline', color: '#10B981' },
    'Question Papers': { icon: 'newspaper-outline', color: '#F59E0B' },
    'Important Questions': { icon: 'star-outline', color: '#EF4444' },
    'Lab Materials': { icon: 'beaker-outline', color: '#8B5CF6' },
    'Record Notes': { icon: 'journal-outline', color: '#EC4899' },
    'Viva Questions': { icon: 'chatbubbles-outline', color: '#06B6D4' },
    'Video Resources': { icon: 'videocam-outline', color: '#6366F1' },
  };

  useEffect(() => {
    async function loadData() {
      try {
        const allMaterials = await fetchAllMaterials();
        
        // Filter materials matching dept, sem and subject
        const filtered = allMaterials.filter(
          (m) =>
            (m.dept.toUpperCase() === dept.toUpperCase() || m.dept.toUpperCase() === 'COMMON' || m.dept.toUpperCase() === 'ALL') &&
            String(m.sem) === String(sem) &&
            m.subject.toLowerCase() === subject.toLowerCase()
        );
        
        setSubjectMaterials(filtered);

        // Count materials per type
        const tempCounts: Record<string, number> = {};
        filtered.forEach((m) => {
          tempCounts[m.material_type] = (tempCounts[m.material_type] || 0) + 1;
        });
        setCounts(tempCounts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dept, sem, subject]);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{subject}</Text>
          <Text style={styles.headerSubtitle}>Sem {sem} • {dept}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Syncing resources...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {Object.keys(counts).length === 0 ? (
            <View style={styles.loaderContainer}>
              <Text style={styles.loadingText}>No resources synced from database yet.</Text>
            </View>
          ) : (
            Object.keys(counts).map((type, idx) => {
              const count = counts[type] || 0;
              const matchedKey = Object.keys(categoryConfig).find(k => k.toLowerCase() === type.toLowerCase());
              const config = matchedKey ? categoryConfig[matchedKey] : { icon: 'folder-outline', color: '#6366F1' };

              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: '/units',
                      params: {
                        sem,
                        dept,
                        subject,
                        material_type: type,
                      },
                    })
                  }
                >
                  <View style={styles.cardLeft}>
                    <View style={[styles.iconBadge, { backgroundColor: config.color + '15' }]}>
                      <Ionicons name={config.icon as any} size={22} color={config.color} />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.cardTitle}>{type}</Text>
                      <Text style={styles.cardCount}>
                        {count} {count === 1 ? 'Resource' : 'Resources'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
