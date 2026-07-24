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
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { COLORS } from '../constants/theme';
import { fetchAllMaterials, fetchAnnouncements } from '../helpers/api';
import { Material, Announcement } from '../types/material';

export default function UpdatesScreen() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  const [updateTab, setUpdateTab] = useState<'all' | 'announcements' | 'workshops'>('all');
  const [reactions, setReactions] = useState<{[id: string]: string}>({});

  const toggleReaction = (id: string, emoji: string) => {
    setReactions(prev => ({
      ...prev,
      [id]: prev[id] === emoji ? '' : emoji
    }));
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      async function loadData() {
        try {
          const [mats, anns] = await Promise.all([
            fetchAllMaterials(),
            fetchAnnouncements()
          ]);
          if (isActive) {
            setMaterials(mats);
            setAnnouncements(anns);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      loadData();
      return () => { isActive = false; };
    }, [])
  );

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
        <View style={{ padding: 16 }}>
          {/* Skeleton Tabs */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            <View style={{ width: 120, height: 40, backgroundColor: '#E5E7EB', borderRadius: 20 }} />
            <View style={{ width: 140, height: 40, backgroundColor: '#E5E7EB', borderRadius: 20 }} />
          </View>
          {/* Skeleton List Items */}
          {[1, 2, 3].map(i => (
            <View key={i} style={{ width: '100%', height: 160, backgroundColor: '#E5E7EB', borderRadius: 16, marginBottom: 16 }} />
          ))}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* TAB SELECTORS - Fixed at top */}
          <View style={{ paddingHorizontal: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.announcementTabs, { marginTop: 12, marginBottom: 12 }]}>
              {(['all', 'announcements'] as const).map((t) => (
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
                    {t === 'all' ? 'ALL MATERIALS' : t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ANNOUNCEMENTS CONTENT */}
          {updateTab === 'announcements' && (
            <FlatList
              data={announcements.filter(a => a.type === 'announcements')}
              keyExtractor={(item) => item.id || Math.random().toString()}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              ListHeaderComponent={<Text style={[styles.sectionTitle, { marginBottom: 12 }]}>📢 Announcements</Text>}
              renderItem={({ item }) => {
                const getThemeColor = () => {
                  if (item.type === 'workshops') return '#8B5CF6';
                  if (item.title.toLowerCase().includes('important')) return '#EF4444';
                  return '#3B82F6';
                };
                const themeColor = getThemeColor();
                
                return (
                  <View
                    style={[
                      styles.announcementCard,
                      { 
                        backgroundColor: '#FFFFFF', 
                        borderWidth: 1,
                        borderColor: '#F3F4F6',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                        elevation: 2,
                      }
                    ]}
                  >
                    <View style={styles.announcementHeader}>
                      <View style={[
                        styles.announcementBadge,
                        {
                          backgroundColor: themeColor + '1A',
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                        },
                      ]}>
                        <Text style={[
                          styles.announcementBadgeText,
                          {
                            color: themeColor,
                            fontWeight: '800',
                            fontSize: 10,
                          },
                        ]}>
                          {item.type.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.announcementDate, { color: '#6B7280', fontSize: 12, fontWeight: '500' }]}>{item.date}</Text>
                    </View>
                    
                    <Text style={[styles.announcementTitle, { fontSize: 17, fontWeight: '800', color: '#111827', marginTop: 8, marginBottom: 6 }]}>{item.title}</Text>
                    <Text style={[styles.announcementDesc, { fontSize: 14, color: '#4B5563', lineHeight: 22 }]}>{item.details || item.desc}</Text>
                    
                    <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: themeColor + '1A',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                        onPress={() => handleShareAnnouncement(item)}
                      >
                        <Ionicons name="share-social-outline" size={16} color={themeColor} style={{ marginRight: 6 }} />
                        <Text style={{ color: themeColor, fontWeight: '700', fontSize: 13 }}>Share Event</Text>
                      </TouchableOpacity>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {['👍', '❤️', '🔥', '🎉'].map(emoji => (
                          <TouchableOpacity 
                            key={emoji}
                            onPress={() => toggleReaction(item.id, emoji)}
                            style={{
                              backgroundColor: reactions[item.id] === emoji ? '#FEF2F2' : '#F3F4F6',
                              padding: 6,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: reactions[item.id] === emoji ? '#FCA5A5' : 'transparent',
                            }}
                          >
                            <Text style={{ fontSize: 14 }}>{emoji}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}

          {/* MATERIALS CONTENT */}
          {updateTab === 'all' && (
            <FlatList
              data={materials.slice(0, 10)}
              keyExtractor={(item, idx) => item.id ? item.id.toString() : idx.toString()}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              ListHeaderComponent={<Text style={[styles.sectionTitle, { marginBottom: 12 }]}>📂 Latest Document Uploads</Text>}
              ListEmptyComponent={
                <View style={styles.emptyUploadBox}>
                  <Text style={styles.emptyUploadText}>No recent document uploads found in database.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
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
              )}
            />
          )}
        </View>
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
