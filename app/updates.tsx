import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { fetchAllMaterials, fetchAnnouncements } from '../helpers/sheets';
import { Material, Announcement } from '../types/material';

export default function UpdatesScreen() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  const [updateTab, setUpdateTab] = useState<'all' | 'announcements' | 'workshops'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [mats, anns] = await Promise.all([
          fetchAllMaterials(),
          fetchAnnouncements()
        ]);
        setMaterials(mats);
        setAnnouncements(anns);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredAnnouncements = announcements.filter((item) => {
    if (updateTab === 'all') return true;
    return item.type === updateTab;
  });

  const handleShareAnnouncement = async (item: Announcement) => {
    try {
      const message = `📢 *Sairam Hub Update*\n\n*${item.title}*\n📅 Date: ${item.date}\n📍 Venue: ${item.venue}\n\n${item.details || item.desc}\n\nShared via Sairam Hub App.`;
      await Share.share({ message });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Updates & Uploads</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Syncing updates...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* SECTION 1: LATEST ANNOUNCEMENTS & EVENTS */}
          <Text style={styles.sectionTitle}>📢 Announcements & Workshops</Text>
          
          <View style={styles.announcementTabs}>
            {(['all', 'announcements', 'workshops'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.announcementTabItem,
                  updateTab === t && styles.announcementTabItemActive,
                ]}
                onPress={() => setUpdateTab(t)}
              >
                <Text
                  style={[
                    styles.announcementTabLabel,
                    updateTab === t && styles.announcementTabLabelActive,
                  ]}
                >
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredAnnouncements.map((item) => {
            const isExpanded = expandedAnnouncementId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.announcementCard}
                onPress={() => setExpandedAnnouncementId(isExpanded ? null : item.id)}
                activeOpacity={0.9}
              >
                <View style={styles.announcementHeader}>
                  <View style={[
                    styles.announcementBadge,
                    {
                      backgroundColor: item.type === 'workshops' ? '#F5F3FF' : '#FEF3C7',
                    },
                  ]}>
                    <Text style={[
                      styles.announcementBadgeText,
                      {
                        color: item.type === 'workshops' ? COLORS.secondary : COLORS.warning,
                      },
                    ]}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.announcementDate}>{item.date}</Text>
                </View>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={styles.announcementDesc}>{item.desc}</Text>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    <Text style={styles.detailsLabel}>📍 Venue/Platform:</Text>
                    <Text style={styles.detailsText}>{item.venue}</Text>
                    
                    <Text style={styles.detailsLabel}>📝 Event Details:</Text>
                    <Text style={styles.detailsText}>{item.details}</Text>
                    
                    <TouchableOpacity style={styles.shareBtn} onPress={() => handleShareAnnouncement(item)}>
                      <Ionicons name="share-social-outline" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                      <Text style={styles.shareBtnText}>Share Event</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* SECTION 2: LATEST MATERIAL UPLOADS (FROM GOOGLE SHEETS) */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>📂 Latest Document Uploads</Text>
          {materials.length === 0 ? (
            <View style={styles.emptyUploadBox}>
              <Text style={styles.emptyUploadText}>No recent document uploads found in database.</Text>
            </View>
          ) : (
            materials.slice(0, 10).map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.recentUploadCard}
                onPress={() => router.push({ pathname: '/detail', params: { data: JSON.stringify(item) } })}
              >
                <View style={styles.recentUploadLeft}>
                  <Ionicons name="document-text-outline" size={22} color={COLORS.primary} style={{ marginRight: 12 }} />
                  <View style={styles.recentUploadInfo}>
                    <Text style={styles.recentUploadTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.recentUploadSubtitle}>
                      {item.dept} • Sem {item.sem} • {item.material_type}
                    </Text>
                  </View>
                </View>
                <View style={styles.recentUploadRight}>
                  <Text style={styles.recentDate}>{item.date}</Text>
                  <Text style={styles.recentContributor}>By {item.contributor_name}</Text>
                </View>
              </TouchableOpacity>
            ))
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
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
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  announcementTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    height: 36,
  },
  announcementTabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    marginRight: 8,
    justifyContent: 'center',
    height: 32,
  },
  announcementTabItemActive: {
    backgroundColor: COLORS.primary,
  },
  announcementTabLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  announcementTabLabelActive: {
    color: COLORS.white,
  },
  announcementCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  announcementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  announcementBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  announcementDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  announcementDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 2,
  },
  detailsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  shareBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  shareBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  recentUploadCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentUploadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentUploadInfo: {
    flex: 1,
  },
  recentUploadTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recentUploadSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recentUploadRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  recentDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  recentContributor: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyUploadBox: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyUploadText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
