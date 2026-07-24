import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
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
  const initialType = (params.type as string) || 'All';

  const [loading, setLoading] = useState<boolean>(true);
  const [subjectMaterials, setSubjectMaterials] = useState<Material[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [availableTypes, setAvailableTypes] = useState<string[]>(['All']);

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

        // Extract available material types
        const types = Array.from(new Set(filtered.map((m) => m.material_type))).filter(Boolean);
        setAvailableTypes(['All', ...types]);

        if (initialType && (initialType === 'All' || types.includes(initialType))) {
          setActiveFilter(initialType);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dept, sem, subject]);

  const displayedMaterials = subjectMaterials.filter((m) => {
    if (activeFilter === 'All') return true;
    return m.material_type.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleOpenDrive = async (url: string) => {
    try {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      await Linking.openURL(formattedUrl);
    } catch (e: any) {
      Alert.alert('Error', 'Could not open link: ' + (e.message || url));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{subject}</Text>
          <Text style={styles.headerSubtitle}>Sem {sem} • {dept ? dept.toUpperCase() : ''}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Syncing study materials...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* CATEGORY FILTER CHIPS */}
          {availableTypes.length > 2 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
              {availableTypes.map((t) => {
                const isActive = activeFilter === t;
                const count = t === 'All' ? subjectMaterials.length : subjectMaterials.filter(m => m.material_type === t).length;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setActiveFilter(t)}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {t} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* MATERIAL CARDS LIST */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {displayedMaterials.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No resources found</Text>
                <Text style={styles.emptySubtitle}>No uploaded files found for {subject} yet.</Text>
              </View>
            ) : (
              displayedMaterials.map((item, idx) => (
                <View key={idx} style={styles.materialCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="document-text" size={24} color={COLORS.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.materialTitle}>{item.title}</Text>
                        <Text style={styles.materialMeta}>
                          Uploaded by {item.contributor_name || 'Sairam Student'} • {item.date || 'Just now'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{item.material_type}</Text>
                    </View>
                  </View>

                  {/* ACTION BUTTONS */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.openDriveBtn}
                      onPress={() => handleOpenDrive(item.drive_link)}
                    >
                      <Ionicons name="logo-google" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.openDriveBtnText}>Open in Drive</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/detail',
                          params: { data: JSON.stringify(item) },
                        })
                      }
                    >
                      <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  filterScroll: {
    maxHeight: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#6B5DF6',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  materialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#6B5DF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  materialMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B5DF6',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openDriveBtn: {
    flex: 1,
    backgroundColor: '#6B5DF6',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openDriveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  detailsBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
