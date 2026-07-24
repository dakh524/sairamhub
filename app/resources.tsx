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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { fetchAllMaterials } from '../helpers/api';
import { Material } from '../types/material';

const getTypeStyle = (typeStr: string): { colors: readonly [string, string]; icon: string; badgeBg: string; badgeText: string } => {
  const t = (typeStr || '').toLowerCase();
  if (t.includes('note')) return { colors: ['#3B82F6', '#1D4ED8'], icon: 'document-text-outline', badgeBg: '#EFF6FF', badgeText: '#1D4ED8' };
  if (t.includes('question') || t.includes('bank') || t.includes('qb')) return { colors: ['#10B981', '#047857'], icon: 'help-buoy-outline', badgeBg: '#ECFDF5', badgeText: '#047857' };
  if (t.includes('lab') || t.includes('record')) return { colors: ['#8B5CF6', '#6D28D9'], icon: 'beaker-outline', badgeBg: '#F5F3FF', badgeText: '#6D28D9' };
  if (t.includes('video')) return { colors: ['#EF4444', '#B91C1C'], icon: 'videocam-outline', badgeBg: '#FEF2F2', badgeText: '#B91C1C' };
  return { colors: ['#6366F1', '#4338CA'], icon: 'folder-open-outline', badgeBg: '#EEF2FF', badgeText: '#4338CA' };
};

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
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{subject}</Text>
          <Text style={styles.headerSubtitle}>Semester {sem} • {dept ? dept.toUpperCase() : ''}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6B5DF6" />
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
              displayedMaterials.map((item, idx) => {
                const typeConfig = getTypeStyle(item.material_type);

                return (
                  <View key={idx} style={styles.premiumCard}>
                    {/* ACCENT LEFT BAR */}
                    <LinearGradient
                      colors={typeConfig.colors}
                      style={styles.cardAccentBar}
                    />

                    <View style={styles.cardMainContent}>
                      {/* TOP INFO ROW */}
                      <View style={styles.cardTopRow}>
                        <LinearGradient
                          colors={typeConfig.colors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.cardIconBadge}
                        >
                          <Ionicons name={typeConfig.icon as any} size={22} color="#FFFFFF" />
                        </LinearGradient>

                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={styles.materialTitle} numberOfLines={2}>
                            {item.title}
                          </Text>
                          <View style={styles.contributorPillRow}>
                            <Ionicons name="person-circle-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
                            <Text style={styles.contributorText} numberOfLines={1}>
                              {item.contributor_name || 'Sairam Student'}
                            </Text>
                            <Text style={styles.dotSeparator}>•</Text>
                            <Ionicons name="time-outline" size={12} color="#94A3B8" style={{ marginRight: 3 }} />
                            <Text style={styles.dateText}>{item.date || 'Just now'}</Text>
                          </View>
                        </View>

                        <View style={[styles.typeTagBadge, { backgroundColor: typeConfig.badgeBg }]}>
                          <Text style={[styles.typeTagText, { color: typeConfig.badgeText }]}>
                            {item.material_type}
                          </Text>
                        </View>
                      </View>

                      {/* ACTION BUTTONS ROW */}
                      <View style={styles.cardActionRow}>
                        <TouchableOpacity
                          activeOpacity={0.88}
                          style={{ flex: 1 }}
                          onPress={() => handleOpenDrive(item.drive_link)}
                        >
                          <LinearGradient
                            colors={['#4F46E5', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.openDriveGradientBtn}
                          >
                            <Ionicons name="logo-google" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.openDriveBtnText}>Open in Google Drive</Text>
                            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.infoCircleBtn}
                          onPress={() =>
                            router.push({
                              pathname: '/detail',
                              params: { data: JSON.stringify(item) },
                            })
                          }
                        >
                          <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
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
  premiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardAccentBar: {
    width: 6,
    height: '100%',
  },
  cardMainContent: {
    flex: 1,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 4,
  },
  contributorPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contributorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  typeTagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  openDriveGradientBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  openDriveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  infoCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
});
