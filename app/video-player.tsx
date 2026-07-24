import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { dataMap, VideoResource } from '../helpers/materialsData';

export default function VideoPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = (params.category as string) || 'Placement';
  const initialIndex = parseInt(params.videoIndex as string) || 0;

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768; // Web/Tablet breakpoint

  const currentData = dataMap[category] || dataMap.Placement;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState('Overview');
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const selectedVideo = currentData.videos[currentIndex];

  const handleShare = async () => {
    try {
      const url = selectedVideo.videoId 
        ? `https://www.youtube.com/watch?v=${selectedVideo.videoId}`
        : `https://www.youtube.com/playlist?list=${selectedVideo.playList}`;
      await Share.share({
        message: `Check out this awesome ${selectedVideo.language} course video: ${selectedVideo.title}\n\n${url}`
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      Alert.alert('Video finished!');
    }
  }, []);

  if (!selectedVideo) return <View style={styles.container}><Text>Video not found.</Text></View>;

  const thumbId = selectedVideo.videoId || selectedVideo.thumbnailId;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Materials</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => setBookmarked(!bookmarked)}>
          <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={24} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* TOP STATS BANNER */}
        <View style={styles.topStatsBanner}>
          <View style={styles.statsLeft}>
            <View style={styles.iconBadge}><Ionicons name="briefcase" size={24} color="#7C3AED" /></View>
            <View>
              <Text style={styles.statsTitle}>{category} Materials</Text>
              <Text style={styles.statsDesc}>Curated resources, videos, and questions to boost your skills.</Text>
            </View>
          </View>
          <View style={styles.statsRight}>
            <View style={styles.statChip}>
              <View style={[styles.statChipIcon, { backgroundColor: '#F3E8FF' }]}><Ionicons name="play" size={12} color="#7C3AED" /></View>
              <View><Text style={styles.statChipNum}>{currentData.videos.length}+</Text><Text style={styles.statChipLabel}>Videos</Text></View>
            </View>
            <View style={styles.statChip}>
              <View style={[styles.statChipIcon, { backgroundColor: '#FCE7F3' }]}><Ionicons name="book" size={12} color="#DB2777" /></View>
              <View><Text style={styles.statChipNum}>{currentData.roadmap.length}+</Text><Text style={styles.statChipLabel}>Steps</Text></View>
            </View>
            <View style={styles.statChip}>
              <View style={[styles.statChipIcon, { backgroundColor: '#FFEDD5' }]}><Ionicons name="document-text" size={12} color="#EA580C" /></View>
              <View><Text style={styles.statChipNum}>{currentData.links.length}+</Text><Text style={styles.statChipLabel}>Resources</Text></View>
            </View>
          </View>
        </View>

        {/* MAIN LAYOUT (Two Column on Large Screens) */}
        <View style={[styles.mainLayout, isLargeScreen && { flexDirection: 'row' }]}>
          
          {/* LEFT COLUMN: PLAYER & TABS */}
          <View style={[styles.leftColumn, isLargeScreen && { flex: 2, marginRight: 24 }]}>
            
            {/* VIDEO PLAYER */}
            <View style={styles.playerContainer}>
              <YoutubePlayer
                height={isLargeScreen ? 450 : 250}
                play={true}
                videoId={selectedVideo.videoId}
                playList={selectedVideo.playList}
                onChangeState={onStateChange}
              />
            </View>

            {/* VIDEO META */}
            <View style={styles.videoMeta}>
              <Text style={styles.videoTitle}>{selectedVideo.title}</Text>
              <View style={styles.channelInfo}>
                <Ionicons name="school" size={20} color="#10B981" style={{ marginRight: 8 }} />
                <Text style={styles.channelName}>{selectedVideo.language} Course</Text>
              </View>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={[styles.actionButton, liked && { backgroundColor: '#E0E7FF' }]} onPress={() => { setLiked(!liked); setDisliked(false); }}>
                  <Ionicons name={liked ? "thumbs-up" : "thumbs-up-outline"} size={18} color={liked ? "#4F46E5" : "#4B5563"} style={{ marginRight: 6 }}/>
                  <Text style={[styles.actionText, liked && { color: '#4F46E5' }]}>{liked ? '1.2K' : '1.2K'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={18} color="#4B5563" style={{ marginRight: 6 }}/>
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* TABS */}
            <View style={styles.tabsContainer}>
              {['Overview'].map(tab => (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}>
                  <Ionicons name={'information-circle-outline'} size={18} color={activeTab === tab ? '#7C3AED' : '#6B7280'} style={{ marginRight: 6 }}/>
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TAB CONTENT */}
            {activeTab === 'Overview' && (
              <View style={styles.tabContent}>
                <Text style={styles.sectionHeading}>About this Video</Text>
                <Text style={styles.aboutDesc}>Learn the best shortcuts, tricks, and concepts to solve questions faster and easier in your upcoming assessments.</Text>
                
                <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                    <View style={[styles.metricIcon, { backgroundColor: '#F3E8FF' }]}><Ionicons name="time" size={16} color="#7C3AED" /></View>
                    <View><Text style={styles.metricVal}>18:45</Text><Text style={styles.metricLabel}>Duration</Text></View>
                  </View>
                  <View style={styles.metricCard}>
                    <View style={[styles.metricIcon, { backgroundColor: '#EEF2FF' }]}><Ionicons name="stats-chart" size={16} color="#4F46E5" /></View>
                    <View><Text style={styles.metricVal}>Beginner</Text><Text style={styles.metricLabel}>Level</Text></View>
                  </View>
                  <View style={styles.metricCard}>
                    <View style={[styles.metricIcon, { backgroundColor: '#FCE7F3' }]}><Ionicons name="calendar" size={16} color="#DB2777" /></View>
                    <View><Text style={styles.metricVal}>12 Jun 2024</Text><Text style={styles.metricLabel}>Uploaded</Text></View>
                  </View>
                </View>

                <Text style={styles.sectionHeading}>What you'll learn</Text>
                {[
                  'Convert fractions to decimals in seconds',
                  'Important shortcuts for division',
                  'Solve mixed problems with ease',
                  'Concept clarity with real examples'
                ].map((item, idx) => (
                  <View key={idx} style={styles.checkListItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#7C3AED" style={{ marginRight: 12 }} />
                    <Text style={styles.checkListText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            
          </View>

          {/* RIGHT COLUMN: PLAYLIST & UP NEXT */}
          <View style={[styles.rightColumn, isLargeScreen && { flex: 1 }]}>
            
            {/* PLAYLIST SIDEBAR */}
            <View style={styles.sidebarCard}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Playlist</Text>
                <Text style={styles.sidebarCount}>{currentIndex + 1} / {currentData.videos.length}</Text>
              </View>
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {currentData.videos.map((vid, idx) => {
                  const isActive = idx === currentIndex;
                  const vThumbId = vid.videoId || vid.thumbnailId;
                  const num = (idx + 1).toString().padStart(2, '0');
                  return (
                    <TouchableOpacity key={idx} style={[styles.playlistItem, isActive && styles.playlistItemActive]} onPress={() => setCurrentIndex(idx)}>
                      <View style={[styles.playlistThumb, isActive && { backgroundColor: '#7C3AED' }]}>
                        {vThumbId ? (
                           <Image source={{ uri: `https://img.youtube.com/vi/${vThumbId}/hqdefault.jpg` }} style={{ width: '100%', height: '100%', opacity: isActive ? 0.3 : 0.8 }} resizeMode="cover" />
                        ) : null}
                        <View style={{ position: 'absolute' }}>
                          <Text style={[styles.playlistThumbNum, isActive && { color: '#FFFFFF' }]}>{num}</Text>
                        </View>
                      </View>
                      <View style={styles.playlistItemContent}>
                        <Text style={[styles.playlistItemTitle, isActive && { color: '#7C3AED' }]} numberOfLines={2}>{vid.title}</Text>
                        <Text style={styles.playlistItemDesc}>{vid.language}</Text>
                      </View>
                      <View style={styles.playlistPlayIcon}>
                        <Ionicons name={isActive ? "pause-circle-outline" : "play-circle-outline"} size={20} color={isActive ? "#7C3AED" : "#9CA3AF"} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>



          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  scrollContent: { paddingBottom: 100 },
  
  // Top Stats Banner
  topStatsBanner: { backgroundColor: '#F8F5FF', margin: 16, borderRadius: 20, padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' },
  statsLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 250, marginBottom: 12 },
  iconBadge: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EBE5F7', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  statsTitle: { fontSize: 18, fontWeight: 'bold', color: '#4C1D95', marginBottom: 4 },
  statsDesc: { fontSize: 12, color: '#6B7280' },
  statsRight: { flexDirection: 'row', gap: 12 },
  statChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  statChipIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  statChipNum: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  statChipLabel: { fontSize: 9, color: '#6B7280' },

  // Layouts
  mainLayout: { paddingHorizontal: 16 },
  leftColumn: { marginBottom: 24 },
  rightColumn: { },

  // Player & Meta
  playerContainer: { width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: '#000', marginBottom: 20 },
  videoMeta: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  videoTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  channelInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  channelName: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  actionButtonsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },

  // Tabs
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 24 },
  tabButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive: { borderBottomColor: '#7C3AED' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#7C3AED' },
  badge: { backgroundColor: '#7C3AED', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  badgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' },

  // Tab Content
  tabContent: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  sectionHeading: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12, marginTop: 16 },
  aboutDesc: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 24 },
  metricsRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginBottom: 24 },
  metricCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 12, borderRadius: 12, minWidth: 120, borderWidth: 1, borderColor: '#F3F4F6' },
  metricIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  metricVal: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  metricLabel: { fontSize: 11, color: '#6B7280' },
  checkListItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkListText: { fontSize: 14, color: '#4B5563', flex: 1 },

  // Sidebar (Playlist & Notes)
  sidebarCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sidebarTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  sidebarCount: { fontSize: 13, color: '#7C3AED', fontWeight: '600' },
  sidebarLink: { fontSize: 13, color: '#7C3AED', fontWeight: '600' },
  
  playlistItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8, backgroundColor: '#FAFAFA' },
  playlistItemActive: { backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE' },
  playlistThumb: { width: 60, height: 40, borderRadius: 6, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  playlistThumbNum: { fontSize: 12, fontWeight: 'bold', color: '#4B5563' },
  playlistItemContent: { flex: 1 },
  playlistItemTitle: { fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  playlistItemDesc: { fontSize: 11, color: '#6B7280' },
  playlistPlayIcon: { padding: 4 },
  viewAllBtn: { alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 8 },
  viewAllBtnText: { fontSize: 13, fontWeight: '600', color: '#7C3AED' },

  noteItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FAFAFA', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  noteIconWrapper: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  noteTitle: { fontSize: 13, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  noteMeta: { fontSize: 11, color: '#6B7280' },

  // Bottom Banner
  bottomBanner: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#FDF4FF', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#FAE8FF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  bannerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FAE8FF', justifyContent: 'center', alignItems: 'center' },
  bannerTitle: { fontSize: 14, fontWeight: 'bold', color: '#4C1D95', marginBottom: 2 },
  bannerDesc: { fontSize: 11, color: '#6B7280' },
  bannerBtn: { backgroundColor: '#7C3AED', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  bannerBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }
});
