import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import { dataMap } from '../helpers/materialsData';

export default function CareerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = (params.category as string) || 'Placement';

  const currentData = dataMap[category] || dataMap.Placement;

  const [activeFilter, setActiveFilter] = useState('All Videos');

  const handleOpen = async (link: string) => {
    try {
      await WebBrowser.openBrowserAsync(link);
    } catch (err) {
      console.error('Error opening URL inside app:', err);
      Linking.openURL(link);
    }
  };

  // Dynamic Theme based on Category
  const getTheme = () => {
    switch (category) {
      case 'Aptitude': return { bg: ['#FDF4FF', '#F3E8FF'] as const, iconBg: '#FAE8FF', color: '#C026D3', icon: 'bulb-outline' };
      case 'Placement': return { bg: ['#EEF2FF', '#E0E7FF'] as const, iconBg: '#E0E7FF', color: '#4F46E5', icon: 'briefcase-outline' };
      case 'GATE': return { bg: ['#FFF7ED', '#FFEDD5'] as const, iconBg: '#FFEDD5', color: '#EA580C', icon: 'school-outline' };
      case 'Coding': return { bg: ['#ECFDF5', '#D1FAE5'] as const, iconBg: '#D1FAE5', color: '#059669', icon: 'code-slash-outline' };
      default: return { bg: ['#EEF2FF', '#E0E7FF'] as const, iconBg: '#E0E7FF', color: '#4F46E5', icon: 'library-outline' };
    }
  };

  const theme = getTheme();
  
  // Create filters based on languages in the video list
  const filters = ['All Videos', ...Array.from(new Set(currentData.videos.map(v => v.language.split('/')[0])))];
  
  const filteredVideos = currentData.videos.filter(v => activeFilter === 'All Videos' || v.language.includes(activeFilter));

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Materials</Text>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="bookmark-outline" size={24} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HERO BANNER */}
        <LinearGradient
          colors={theme.bg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={[styles.heroIconBadge, { backgroundColor: theme.iconBg }]}>
                <Ionicons name={theme.icon as any} size={32} color={theme.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[styles.heroTitle, { color: theme.color }]}>{category} Materials</Text>
                <Text style={styles.heroDesc}>Curated resources, videos, and questions to boost your skills.</Text>
              </View>
            </View>
            
            <View style={styles.heroStatsContainer}>
              <View style={styles.heroStat}>
                <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}><Ionicons name="play-circle" size={16} color="#4F46E5" /></View>
                <View>
                  <Text style={styles.statVal}>{currentData.videos.length}+</Text>
                  <Text style={styles.statLabel}>Videos</Text>
                </View>
              </View>
              <View style={styles.heroStat}>
                <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}><Ionicons name="book" size={16} color="#9333EA" /></View>
                <View>
                  <Text style={styles.statVal}>{currentData.roadmap.length}+</Text>
                  <Text style={styles.statLabel}>Steps</Text>
                </View>
              </View>
              <View style={styles.heroStat}>
                <View style={[styles.statIcon, { backgroundColor: '#FFEDD5' }]}><Ionicons name="document-text" size={16} color="#EA580C" /></View>
                <View>
                  <Text style={styles.statVal}>{currentData.links.length}+</Text>
                  <Text style={styles.statLabel}>Resources</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* FILTER PILLS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {filters.map((f, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* BEST FOR YOU (Featured/First 2 Videos) */}
        {currentData.videos.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.sectionIconBadge}><Ionicons name="star" size={14} color="#7C3AED" /></View>
                <Text style={styles.sectionTitle}>Best for You</Text>
              </View>
              <Text style={styles.viewAllText}>View All <Ionicons name="chevron-forward" size={12} /></Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {currentData.videos.slice(0, 3).map((vid, idx) => {
                const thumbId = vid.videoId || vid.thumbnailId;
                return (
                <TouchableOpacity key={idx} style={styles.bestCard} onPress={() => router.push(`/video-player?category=${category}&videoIndex=${currentData.videos.indexOf(vid)}`)}>
                  <View style={[styles.bestThumbnail, { backgroundColor: theme.color, padding: 0 }]}>
                    {thumbId ? (
                      <Image source={{ uri: `https://img.youtube.com/vi/${thumbId}/hqdefault.jpg` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <View style={{ padding: 16, justifyContent: 'center', flex: 1 }}>
                        <Text style={styles.bestThumbTitle}>{vid.title}</Text>
                      </View>
                    )}
                    <View style={styles.playButtonFloat}>
                      <Ionicons name="play" size={24} color={theme.color} />
                    </View>
                  </View>
                  <View style={styles.bestCardContent}>
                    <Text style={styles.bestCardTitle} numberOfLines={2}>{vid.title}</Text>
                    <Text style={styles.bestCardDesc}>{vid.language}</Text>
                  </View>
                </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ALL VIDEO LESSONS (Numbered List) */}
        <View style={[styles.sectionContainer, { paddingHorizontal: 16 }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.sectionIconBadge}><Ionicons name="videocam" size={14} color="#7C3AED" /></View>
              <Text style={styles.sectionTitle}>All Video Lessons</Text>
            </View>
            <Text style={styles.viewAllText}>Filter <Ionicons name="filter" size={12} /></Text>
          </View>
          
          {filteredVideos.map((vid, idx) => {
            const num = (idx + 1).toString().padStart(2, '0');
            const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
            const blockColor = colors[idx % colors.length];
            const thumbId = vid.videoId || vid.thumbnailId;
            
            return (
              <TouchableOpacity key={idx} style={styles.videoLessonCard} onPress={() => router.push(`/video-player?category=${category}&videoIndex=${currentData.videos.indexOf(vid)}`)}>
                {thumbId ? (
                  <View style={[styles.videoNumberBlock, { padding: 0, overflow: 'hidden', backgroundColor: blockColor }]}>
                     <Image source={{ uri: `https://img.youtube.com/vi/${thumbId}/hqdefault.jpg` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </View>
                ) : (
                  <View style={[styles.videoNumberBlock, { backgroundColor: blockColor }]}>
                    <Text style={styles.videoNumberText}>{num}</Text>
                  </View>
                )}
                <View style={styles.videoLessonContent}>
                  <Text style={styles.videoLessonTitle} numberOfLines={2}>{vid.title}</Text>
                  <Text style={styles.videoLessonDesc} numberOfLines={1}>{vid.playList ? 'Playlist' : 'Single Video'}</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: blockColor + '20' }]}>
                    <Text style={[styles.categoryBadgeText, { color: blockColor }]}>{vid.language}</Text>
                  </View>
                </View>
                <View style={styles.playIconContainer}>
                  <Ionicons name="play-circle" size={32} color="#7C3AED" />
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* BOTTOM RESOURCE CARDS */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionHeader, { paddingHorizontal: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.sectionIconBadge}><Ionicons name="document-text" size={14} color="#7C3AED" /></View>
              <Text style={styles.sectionTitle}>Practice & Resources</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {currentData.links.map((link, idx) => (
              <TouchableOpacity key={idx} style={styles.resourceSquareCard} onPress={() => handleOpen(link.link)}>
                <View style={styles.resourceIconWrapper}>
                  <Text style={styles.resourceEmoji}>{link.icon}</Text>
                </View>
                <Text style={styles.resourceCardTitle} numberOfLines={2}>{link.title}</Text>
                <Text style={styles.resourceCardDesc} numberOfLines={2}>{link.desc}</Text>
                <View style={styles.resourceChevron}>
                  <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  scrollContent: { paddingBottom: 40 },
  
  // Hero Banner
  heroBanner: { margin: 16, borderRadius: 24, padding: 24 },
  heroContent: {},
  heroIconBadge: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  heroDesc: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  heroStatsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, backgroundColor: 'rgba(255,255,255,0.6)', padding: 12, borderRadius: 16 },
  heroStat: { flexDirection: 'row', alignItems: 'center' },
  statIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  statVal: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 10, color: '#6B7280' },

  // Filters
  filterScroll: { marginBottom: 24 },
  filterPill: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FFFFFF', borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  filterPillActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  filterTextActive: { color: '#FFFFFF' },

  // Sections
  sectionContainer: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16 },
  sectionIconBadge: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  viewAllText: { fontSize: 13, fontWeight: '600', color: '#7C3AED' },

  // Best For You
  bestCard: { width: 260, marginRight: 16, backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  bestThumbnail: { height: 140, padding: 16, justifyContent: 'center' },
  bestThumbTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', textTransform: 'uppercase', opacity: 0.9 },
  playButtonFloat: { position: 'absolute', bottom: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  bestCardContent: { padding: 16 },
  bestCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  bestCardDesc: { fontSize: 12, color: '#6B7280' },

  // Numbered List
  videoLessonCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  videoNumberBlock: { width: 64, height: 64, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  videoNumberText: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  videoLessonContent: { flex: 1 },
  videoLessonTitle: { fontSize: 14, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  videoLessonDesc: { fontSize: 11, color: '#6B7280', marginBottom: 6 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  categoryBadgeText: { fontSize: 10, fontWeight: 'bold' },
  playIconContainer: { padding: 8 },

  // Bottom Resource Cards
  resourceSquareCard: { width: 140, height: 160, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginRight: 16, borderWidth: 1, borderColor: '#F3F4F6', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  resourceIconWrapper: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  resourceEmoji: { fontSize: 20 },
  resourceCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  resourceCardDesc: { fontSize: 11, color: '#6B7280', flex: 1 },
  resourceChevron: { alignSelf: 'flex-start', marginTop: 8 },
});
