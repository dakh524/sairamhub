import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Dimensions,
  Share,
  Alert,
  Image,
  ImageBackground,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS } from '../constants/theme';

// Removed Image.resolveAssetSource due to React Native Web incompatibility

import { fetchAllMaterials, fetchAnnouncements } from '../helpers/sheets';
import { registerForPushNotificationsAsync, scheduleLocalNotification } from '../helpers/notifications';
import { Material, Announcement } from '../types/material';

const { width } = Dimensions.get('window');

const SEMESTER_THEMES = [
  { sem: '1', bg: '#FFECEC', color: '#FF5252', icon: 'leaf-outline' as any },
  { sem: '2', bg: '#E3F2FD', color: '#2196F3', icon: 'water-outline' as any },
  { sem: '3', bg: '#E8F5E9', color: '#4CAF50', icon: 'bulb-outline' as any },
  { sem: '4', bg: '#FFF3E0', color: '#FF9800', icon: 'flame-outline' as any },
  { sem: '5', bg: '#F3E5F5', color: '#9C27B0', icon: 'hardware-chip-outline' as any },
  { sem: '6', bg: '#E0F7FA', color: '#00BCD4', icon: 'rocket-outline' as any },
  { sem: '7', bg: '#FBE9E7', color: '#FF5722', icon: 'briefcase-outline' as any },
  { sem: '8', bg: '#ECEFF1', color: '#607D8B', icon: 'school-outline' as any },
];

const DEFAULT_BELL_SCHEDULE = [
  { name: 'Period 1', startH: 8, startM: 30, endH: 9, endM: 20, isBreak: false },
  { name: 'Period 2', startH: 9, startM: 20, endH: 10, endM: 10, isBreak: false },
  { name: 'Morning Break', startH: 10, startM: 10, endH: 10, endM: 30, isBreak: true },
  { name: 'Period 3', startH: 10, startM: 30, endH: 11, endM: 20, isBreak: false },
  { name: 'Period 4', startH: 11, startM: 20, endH: 12, endM: 10, isBreak: false },
  { name: 'Lunch', startH: 12, startM: 10, endH: 13, endM: 0, isBreak: true },
  { name: 'Period 5', startH: 13, startM: 0, endH: 13, endM: 50, isBreak: false },
  { name: 'Period 6', startH: 13, startM: 50, endH: 14, endM: 40, isBreak: false },
  { name: 'Period 7', startH: 14, startM: 40, endH: 15, endM: 30, isBreak: false },
];

export default function MainApp() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'home' | 'materials' | 'career' | 'updates' | 'more'>('home');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [serverError, setServerError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confetti ref
  const confettiRef = React.useRef<ConfettiCannon>(null);

  // Bell Schedule State
  const [bellSchedule, setBellSchedule] = useState<any[]>(DEFAULT_BELL_SCHEDULE);
  const [currentPeriod, setCurrentPeriod] = useState<any>(null);
  const [nextPeriod, setNextPeriod] = useState<any>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('--m --s left');
  const [scheduleStatus, setScheduleStatus] = useState<string>('Loading...');
  const [bellProgressPct, setBellProgressPct] = useState(0);
  const [isManageModalVisible, setIsManageModalVisible] = useState(false);
  const [newPeriod, setNewPeriod] = useState({ name: '', startH: '', startM: '', endH: '', endM: '' });

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const stored = await AsyncStorage.getItem('bell_schedule');
        if (stored) {
          setBellSchedule(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load schedule', e);
      }
    };
    loadSchedule();
  }, []);

  const saveSchedule = async (newSchedule: any[]) => {
    try {
      newSchedule.sort((a, b) => (a.startH * 60 + a.startM) - (b.startH * 60 + b.startM));
      setBellSchedule(newSchedule);
      await AsyncStorage.setItem('bell_schedule', JSON.stringify(newSchedule));
    } catch (e) {
      console.error('Failed to save schedule', e);
    }
  };

  const addPeriod = () => {
    if (!newPeriod.name || !newPeriod.startH || !newPeriod.startM || !newPeriod.endH || !newPeriod.endM) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const schedule = [...bellSchedule, {
      name: newPeriod.name,
      startH: parseInt(newPeriod.startH),
      startM: parseInt(newPeriod.startM),
      endH: parseInt(newPeriod.endH),
      endM: parseInt(newPeriod.endM),
      isBreak: newPeriod.name.toLowerCase().includes('break') || newPeriod.name.toLowerCase().includes('lunch')
    }];
    saveSchedule(schedule);
    setNewPeriod({ name: '', startH: '', startM: '', endH: '', endM: '' });
  };

  const deletePeriod = (index: number) => {
    const schedule = [...bellSchedule];
    schedule.splice(index, 1);
    saveSchedule(schedule);
  };

  useEffect(() => {
    const updateBellSchedule = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      
      let foundCurrent = null;
      let foundNext = null;

      for (let i = 0; i < bellSchedule.length; i++) {
        const period = bellSchedule[i];
        const startTotalMins = period.startH * 60 + period.startM;
        const endTotalMins = period.endH * 60 + period.endM;

        if (currentMinutes >= startTotalMins && currentMinutes < endTotalMins) {
          foundCurrent = period;
          
          // Calculate progress
          const totalDurationSecs = (endTotalMins - startTotalMins) * 60;
          const elapsedSecs = ((currentMinutes - startTotalMins) * 60) + currentSeconds;
          const pct = Math.min(100, Math.max(0, (elapsedSecs / totalDurationSecs) * 100));
          setBellProgressPct(pct);

          // Calculate time left
          const remainingSecs = totalDurationSecs - elapsedSecs;
          const rMins = Math.floor(remainingSecs / 60);
          const rSecs = remainingSecs % 60;
          setTimeLeftStr(`${rMins.toString().padStart(2, '0')}m ${rSecs.toString().padStart(2, '0')}s`);
          setScheduleStatus('Active');
          
          // Find next
          if (i + 1 < bellSchedule.length) {
            foundNext = bellSchedule[i + 1];
          } else {
            foundNext = { name: 'College Ends' };
          }
          break;
        } else if (currentMinutes < startTotalMins) {
          if (!foundCurrent) {
             foundNext = period;
          }
          break;
        }
      }

      setCurrentPeriod(foundCurrent);
      if (!foundCurrent && foundNext) {
        setNextPeriod(foundNext);
        setTimeLeftStr('--m --s');
        setScheduleStatus('Before College');
        setBellProgressPct(0);
      } else if (!foundCurrent && !foundNext) {
        setNextPeriod({ name: 'Tomorrow' });
        setTimeLeftStr('--m --s');
        setScheduleStatus('After College');
        setBellProgressPct(100);
      } else {
        setNextPeriod(foundNext);
      }
    };

    updateBellSchedule();
    const interval = setInterval(updateBellSchedule, 1000);
    return () => clearInterval(interval);
  }, [bellSchedule]);

  const TabItem = ({ label, tabName, iconName }: any) => {
    const isActive = activeTab === tabName;

    return (
      <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab(tabName as any)}>
        <View>
          <Ionicons
            name={isActive ? iconName : `${iconName}-outline`}
            size={22}
            color={isActive ? COLORS.primary : COLORS.textSecondary}
          />
        </View>
        <Text style={[styles.tabItemText, isActive && styles.tabItemTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  // Today's Works tasks state
  const [todoList, setTodoList] = useState([
    { id: 1, text: 'Submit Digital Electronics Lab Record', completed: false },
    { id: 2, text: 'Complete Aptitude Practice test sets', completed: false },
    { id: 3, text: 'Review Signals & Systems lecture notes', completed: true },
  ]);
  const [newTodoText, setNewTodoText] = useState('');

  const toggleTodo = (id: number) => {
    const todo = todoList.find((t) => t.id === id);
    if (todo && !todo.completed) {
      confettiRef.current?.start();
    }
    
    setTodoList(
      todoList.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const addTodo = () => {
    if (newTodoText.trim() === '') return;
    setTodoList([
      ...todoList,
      { id: Date.now(), text: newTodoText.trim(), completed: false }
    ]);
    setNewTodoText('');
  };

  const deleteTodo = (id: number) => {
    setTodoList(todoList.filter((todo) => todo.id !== id));
  };

  const needToRead = announcements.map((a, idx) => ({
    id: `r${idx}`,
    title: a.title,
    desc: `${a.message} • ${a.date}`,
    link: a.link,
  }));

  // Updates tab state
  const [updateTab, setUpdateTab] = useState<'all' | 'announcements' | 'uploads' | 'workshops'>('all');
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);

  const handleShareAnnouncement = async (item: any) => {
    try {
      const message = `📢 *Sairam Hub Update*\n\n*${item.title}*\n📅 Date: ${item.date}\n📍 Venue: ${item.venue}\n\n${item.details || item.desc}\n\nShared via Sairam Hub App.`;
      await Share.share({ message });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync();
    
    async function loadData() {
      try {
        const [mats, anns] = await Promise.all([
          fetchAllMaterials(),
          fetchAnnouncements()
        ]);
        setMaterials(mats);
        setAnnouncements(anns);
        setServerError(false);

        // Check for new notifications
        const prevAnnsCount = await AsyncStorage.getItem('anns_count');
        const prevMatsCount = await AsyncStorage.getItem('mats_count');
        
        if (prevAnnsCount !== null && anns.length > parseInt(prevAnnsCount, 10)) {
          scheduleLocalNotification('📢 New Announcement!', 'Check the Updates tab for new college announcements.');
        }
        
        if (prevMatsCount !== null && mats.length > parseInt(prevMatsCount, 10)) {
          scheduleLocalNotification('📚 New Study Material!', 'Fresh notes have just been uploaded to Sairam Hub.');
        }

        await AsyncStorage.setItem('anns_count', anns.length.toString());
        await AsyncStorage.setItem('mats_count', mats.length.toString());

      } catch (err) {
        console.error(err);
        setServerError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter latest uploads (first 5 approved materials)
  const latestUploads = materials.slice(0, 5);

  const filteredAnnouncements = announcements.filter((item) => {
    if (updateTab === 'all') return true;
    return item.type === updateTab;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ConfettiCannon
        count={50}
        origin={{ x: width / 2, y: 0 }}
        autoStart={false}
        ref={confettiRef as any}
        fadeOut={true}
        fallSpeed={2500}
      />
      {/* HEADER */}
      <View style={styles.header}>
        {/* Placeholder for left-balance to keep center title perfectly centered */}
        <View style={{ width: 40 }} />
        <View style={[styles.logoContainer, { height: 50, width: 160, justifyContent: 'center', alignItems: 'center' }]}>
          <Image 
            source={require('../assets/images/app_logo.png')} 
            style={{ height: '100%', width: '100%', resizeMode: 'contain', transform: [{ scale: 3.0 }] }} 
          />
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/updates')}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT AREA */}
      <View style={styles.content}>
        {serverError ? (
          <View style={styles.loaderContainer}>
            <Ionicons name="construct-outline" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 }}>Server Maintenance</Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40 }}>We are currently updating our database. Please check back shortly.</Text>
          </View>
        ) : loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Syncing Resources...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {activeTab === 'home' && (
              <View style={styles.tabContent}>
                {/* WELCOME SECTION */}
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcomeTitle}>Welcome, Future Engineer! 👋</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Access everything you need to learn, prepare and succeed.
                  </Text>
                </View>



                {/* SEARCH BAR */}
                <TouchableOpacity
                  style={styles.searchBarContainer}
                  onPress={() => router.push('/search')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.searchPlaceholder}>Search subjects, materials, PYQ, etc...</Text>
                  <View>
                    <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
                  </View>
                </TouchableOpacity>

                {/* HERO BANNER */}
                <View style={[styles.heroCard, { padding: 0, borderWidth: 0, overflow: 'hidden', aspectRatio: width < 600 ? 2.0 : 2.6 }]}>
                  <Image 
                    source={require('../assets/images/hero_banner.jpg')} 
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
                  />
                </View>

                {/* TODAY'S WORKS (Reminders & Tasks) */}
                <Text style={styles.sectionTitle}>Today's Tasks</Text>
                <View style={styles.todoContainer}>
                  {/* INPUT ROW */}
                  <View style={styles.todoInputRow}>
                    <TextInput
                      style={styles.todoInput}
                      placeholder="Add a new task..."
                      placeholderTextColor={COLORS.textSecondary}
                      value={newTodoText}
                      onChangeText={setNewTodoText}
                    />
                    <TouchableOpacity style={styles.todoAddButton} onPress={addTodo}>
                      <Text style={styles.todoAddButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  {/* TODO LIST ITEMS */}
                  {todoList.map((todo) => (
                    <View key={todo.id} style={styles.todoRow}>
                      <TouchableOpacity
                        style={styles.todoRowClickable}
                        onPress={() => toggleTodo(todo.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={todo.completed ? "checkmark-circle" : "ellipse-outline"}
                          size={20}
                          color={todo.completed ? COLORS.success : COLORS.primary}
                          style={{ marginRight: 12 }}
                        />
                        <Text style={[
                          styles.todoText,
                          todo.completed && styles.todoTextCompleted
                        ]} numberOfLines={2}>
                          {todo.text}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.todoDeleteButton} onPress={() => deleteTodo(todo.id)}>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>


                {/* CAREER RESOURCES */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Career Resources</Text>
                  <TouchableOpacity onPress={() => router.push('/career')}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  <TouchableOpacity
                    style={styles.horizontalCard}
                    onPress={() => router.push({ pathname: '/career-detail', params: { category: 'Placement' } })}
                  >
                    <Ionicons name="briefcase-outline" size={24} color={COLORS.primary} style={styles.careerIcon} />
                    <Text style={styles.careerLabel}>Placement</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.horizontalCard}
                    onPress={() => router.push({ pathname: '/career-detail', params: { category: 'Aptitude' } })}
                  >
                    <MaterialCommunityIcons name="brain" size={24} color={COLORS.secondary} style={styles.careerIcon} />
                    <Text style={styles.careerLabel}>Aptitude</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.horizontalCard}
                    onPress={() => router.push({ pathname: '/career-detail', params: { category: 'Coding' } })}
                  >
                    <Ionicons name="code-slash-outline" size={24} color="#10B981" style={styles.careerIcon} />
                    <Text style={styles.careerLabel}>Coding</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.horizontalCard}
                    onPress={() => router.push({ pathname: '/career-detail', params: { category: 'Internships' } })}
                  >
                    <Ionicons name="paper-plane-outline" size={24} color="#F59E0B" style={styles.careerIcon} />
                    <Text style={styles.careerLabel}>Internships</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* RECENTLY ADDED */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Recently Added</Text>
                  <TouchableOpacity onPress={() => router.push('/search')}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                {latestUploads.length === 0 ? (
                  <View style={styles.emptyRecentBox}>
                    <Text style={styles.emptyRecentText}>No uploads synced from database yet.</Text>
                  </View>
                ) : (
                  latestUploads.map((item, idx) => (
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


              </View>
            )}

            {/* TAB: MATERIALS (Lists Semesters 1 to 8 directly) */}
            {activeTab === 'materials' && (
              <View style={styles.tabContent}>
                <Text style={styles.tabHeaderTitle}>Academic Materials</Text>
                <Text style={styles.tabHeaderSubtitle}>Select your semester to explore resources</Text>
                
                <View style={styles.semesterGridContainer}>
                  {SEMESTER_THEMES.map((item) => (
                    <TouchableOpacity
                      key={item.sem}
                      style={[styles.semesterGridCard, { borderColor: item.bg, borderBottomWidth: 3 }]}
                      onPress={() =>
                        router.push({
                          pathname: '/department',
                          params: { sem: item.sem },
                        })
                      }
                    >
                      <View style={[styles.semesterIconBadge, { backgroundColor: item.bg }]}>
                        <Ionicons name={item.icon} size={18} color={item.color} />
                      </View>
                      <Text style={styles.semesterLabel}>Semester {item.sem}</Text>
                      <Text style={[styles.semesterExploreText, { color: item.color }]}>Explore →</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* MATERIALS BANNER */}
                <View style={{ marginTop: 24, marginBottom: 90 }}>
                  <ImageBackground 
                    source={require('../assets/images/materials_banner.jpg')} 
                    style={[styles.heroCard, { padding: 16, height: 130, borderWidth: 0, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 0 }]}
                    imageStyle={{ borderRadius: 16, resizeMode: 'cover' }}
                  >
                    <View style={{ width: '70%', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 10, borderRadius: 10 }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 2 }}>
                        Sairam Hub
                      </Text>
                      <Text style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 }}>
                        Student searching study material in Sairam Hub
                      </Text>
                    </View>
                  </ImageBackground>
                </View>


              </View>
            )}

            {/* TAB: CAREER HUB */}
            {activeTab === 'career' && (
              <View style={styles.tabContent}>
                <Text style={styles.tabHeaderTitle}>Career Hub</Text>
                <Text style={styles.tabHeaderSubtitle}>Prepare for recruitment drives and placements</Text>

                {[
                  { title: 'Placement Materials', icon: 'briefcase-outline', desc: 'Resume Templates, HR Questions, Company Preparation', url: 'https://www.geeksforgeeks.org/placements-gq/', color: COLORS.primary },
                  { title: 'Aptitude Materials', icon: 'bulb-outline', desc: 'Quantitative, Reasoning, Verbal ability practice questions', url: 'https://www.indiabix.com/', color: COLORS.secondary },
                  { title: 'GATE Materials', icon: 'school-outline', desc: 'Formula sheets, syllabus keys, previous year mock tests', url: 'https://gateoverflow.in/', color: '#EF4444' },
                  { title: 'Internship Resources', icon: 'paper-plane-outline', desc: 'Resume building guidelines, roadmaps, project ideas', url: 'https://internshala.com/', color: '#F59E0B' },
                  { title: 'Coding Resources', icon: 'code-slash-outline', desc: 'C++, Java, Python, LeetCode patterns & answers', url: 'https://leetcode.com/problemset/all/', color: '#10B981' },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.careerHubCard}
                    onPress={() => Linking.openURL(item.url)}
                  >
                    <View style={styles.careerHubCardLeft}>
                      <View style={[styles.careerHubIconBadge, { backgroundColor: item.color + '15' }]}>
                        <Ionicons name={item.icon as any} size={22} color={item.color} />
                      </View>
                      <View style={styles.careerHubTextContainer}>
                        <Text style={styles.careerHubTitle}>{item.title}</Text>
                        <Text style={styles.careerHubDesc} numberOfLines={2}>
                          {item.desc}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* TAB: UPDATES */}
            {activeTab === 'updates' && (
              <View style={styles.tabContent}>
                <Text style={styles.tabHeaderTitle}>Updates & Uploads</Text>
                
                {/* SECTION 1: ANNOUNCEMENTS */}
                <Text style={[styles.sectionTitle, { marginTop: 12 }]}>📢 Announcements & Workshops</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.announcementTabs}>
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
                </ScrollView>

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
                          
                          <TouchableOpacity
                            style={styles.shareBtn}
                            onPress={() => handleShareAnnouncement(item)}
                          >
                            <Ionicons name="share-social-outline" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                            <Text style={styles.shareBtnText}>Share Event</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                {/* SECTION 2: LIVE UPLOADS */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>📂 Latest Document Uploads</Text>
                {materials.length === 0 ? (
                  <View style={styles.emptyRecentBox}>
                    <Text style={styles.emptyRecentText}>No uploads synced from database yet.</Text>
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
              </View>
            )}

            {/* TAB: MORE FEATURES */}
            {activeTab === 'more' && (
              <View style={styles.tabContent}>
                <Text style={styles.tabHeaderTitle}>More Features</Text>
                <Text style={styles.tabHeaderSubtitle}>Explore extra tools and utilities</Text>
                
                {/* BELL SCHEDULE COMPONENT */}
                <View style={styles.bellScheduleCard}>
                  <View style={styles.bellHeaderRow}>
                    <View style={styles.bellTitleRow}>
                      <Ionicons name="time" size={20} color={COLORS.primary} />
                      <Text style={styles.bellTitle}>Bell Schedule</Text>
                      <TouchableOpacity onPress={() => setIsManageModalVisible(true)} style={{ marginLeft: 10, padding: 4, backgroundColor: COLORS.border, borderRadius: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.text }}>⚙️ Manage</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  </View>

                  <View style={styles.bellInfoRow}>
                    <View style={[styles.bellCurrentBox, { alignItems: 'flex-start' }]}>
                      <Text style={styles.bellSubLabel}>Current</Text>
                      <Text style={styles.bellCurrentName}>
                        {currentPeriod ? currentPeriod.name : (scheduleStatus === 'After College' ? 'College Over' : 'Waiting...')}
                      </Text>
                    </View>
                    
                    <View style={{ flex: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={[styles.bellTimeLeft, { fontSize: 24, color: '#EF4444', fontWeight: '900', textAlign: 'center' }]}>
                        {timeLeftStr}
                      </Text>
                    </View>

                    <View style={styles.bellNextBox}>
                      <Text style={styles.bellSubLabel}>Next</Text>
                      <Text style={styles.bellNextName}>
                        {nextPeriod ? nextPeriod.name : '--'}
                      </Text>
                      {nextPeriod && nextPeriod.startH && (
                        <Text style={styles.bellNextTime}>
                          {`${nextPeriod.startH > 12 ? nextPeriod.startH - 12 : nextPeriod.startH}:${nextPeriod.startM.toString().padStart(2, '0')} ${nextPeriod.startH >= 12 ? 'PM' : 'AM'}`}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.bellProgressBarContainer}>
                    <View style={[styles.bellProgressFill, { width: `${bellProgressPct}%` }]} />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 }}>
                  
                  {/* CGPA CALCULATOR CARD */}
                  <TouchableOpacity style={[styles.featureGridCard, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]} onPress={() => router.push('/cgpa')}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={[styles.featureIconBadge, { backgroundColor: '#DCFCE7' }]}>
                        <Ionicons name="calculator" size={24} color="#16A34A" />
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </View>
                    <Text style={styles.featureGridTitle}>CGPA Calculator</Text>
                    <Text style={styles.featureGridDesc}>Calculate your SGPA & CGPA instantly</Text>
                  </TouchableOpacity>

                  {/* EXAM COUNTDOWN CARD */}
                  <TouchableOpacity style={[styles.featureGridCard, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]} onPress={() => router.push('/countdown')}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={[styles.featureIconBadge, { backgroundColor: '#DBEAFE' }]}>
                        <Ionicons name="timer-outline" size={24} color="#2563EB" />
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </View>
                    <Text style={styles.featureGridTitle}>Exam Countdown</Text>
                    <Text style={styles.featureGridDesc}>Track your upcoming exams</Text>
                  </TouchableOpacity>

                  {/* AGE CALCULATOR CARD */}
                  <TouchableOpacity style={[styles.featureGridCard, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]} onPress={() => router.push('/age-calculator')}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={[styles.featureIconBadge, { backgroundColor: '#FFEDD5' }]}>
                        <Ionicons name="calendar-outline" size={24} color="#EA580C" />
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </View>
                    <Text style={styles.featureGridTitle}>Age Calculator</Text>
                    <Text style={styles.featureGridDesc}>Calculate your exact age in days</Text>
                  </TouchableOpacity>

                  {/* STOPWATCH CARD */}
                  <TouchableOpacity style={[styles.featureGridCard, { backgroundColor: '#FFF1F2', borderColor: '#FFE4E6' }]} onPress={() => router.push('/stopwatch')}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={[styles.featureIconBadge, { backgroundColor: '#FFE4E6' }]}>
                        <Ionicons name="stopwatch-outline" size={24} color="#E11D48" />
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </View>
                    <Text style={styles.featureGridTitle}>Stopwatch</Text>
                    <Text style={styles.featureGridDesc}>High-precision lap timer</Text>
                  </TouchableOpacity>

                </View>

                {/* HORIZONTAL CARDS */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                  {/* Notes */}
                  <TouchableOpacity style={[styles.featureGridCard, { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE', marginBottom: 0 }]} activeOpacity={0.9}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={[styles.featureIconBadge, { backgroundColor: '#EDE9FE', marginBottom: 0, marginRight: 12 }]}>
                          <Ionicons name="document-text" size={20} color="#6D28D9" />
                        </View>
                        <View style={{flex: 1}}>
                          <Text style={styles.featureGridTitle}>Notes</Text>
                          <Text style={styles.featureGridDesc}>View and share study materials</Text>
                        </View>
                    </View>
                  </TouchableOpacity>

                  {/* Study Groups */}
                  <TouchableOpacity style={[styles.featureGridCard, { backgroundColor: '#FEFCE8', borderColor: '#FEF08A', marginBottom: 0 }]} activeOpacity={0.9}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={[styles.featureIconBadge, { backgroundColor: '#FEF08A', marginBottom: 0, marginRight: 12 }]}>
                          <Ionicons name="people" size={20} color="#CA8A04" />
                        </View>
                        <View style={{flex: 1}}>
                          <Text style={styles.featureGridTitle}>Study Groups</Text>
                          <Text style={styles.featureGridDesc}>Connect and study together</Text>
                        </View>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* PROMO BANNER */}
                <View style={{ backgroundColor: '#EEF2FF', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 30, overflow: 'hidden' }}>
                  <View style={{ flex: 1, zIndex: 2 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3730A3', marginBottom: 4 }}>Stay Organized, Stay Ahead!</Text>
                    <Text style={{ fontSize: 12, color: '#4F46E5' }}>Access all your academic tools in one place.</Text>
                  </View>
                  <Ionicons name="school" size={90} color="#C7D2FE" style={{ position: 'absolute', right: -15, bottom: -20, zIndex: 1, transform: [{ rotate: '-10deg' }] }} />
                </View>

                {/* GAMES & FUN SECTION */}
                <Text style={[styles.tabHeaderTitle, { marginTop: 10, fontSize: 22 }]}>Games & Fun</Text>
                <Text style={styles.tabHeaderSubtitle}>Mini-games to play with friends</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, paddingBottom: 40 }}>
                  
                  {/* LUCKY DRAW */}
                  <TouchableOpacity style={styles.gameCard} onPress={() => router.push('/lucky-draw')}>
                    <View style={[styles.gameIconBox, { backgroundColor: '#8B5CF6' }]}>
                      <Ionicons name="gift" size={28} color={COLORS.white} />
                    </View>
                    <Text style={styles.gameTitle}>Lucky Draw</Text>
                    <Text style={styles.gameDesc}>Pick a random winner</Text>
                  </TouchableOpacity>

                  {/* COIN FLIP */}
                  <TouchableOpacity style={styles.gameCard} onPress={() => router.push('/coin-flip')}>
                    <View style={[styles.gameIconBox, { backgroundColor: '#F59E0B' }]}>
                      <Ionicons name="aperture" size={28} color={COLORS.white} />
                    </View>
                    <Text style={styles.gameTitle}>Coin Flip</Text>
                    <Text style={styles.gameDesc}>Heads or Tails 3D</Text>
                  </TouchableOpacity>

                  {/* TRUTH OR DARE */}
                  <TouchableOpacity style={styles.gameCard} onPress={() => router.push('/truth-dare')}>
                    <View style={[styles.gameIconBox, { backgroundColor: '#EC4899' }]}>
                      <Ionicons name="flame" size={28} color={COLORS.white} />
                    </View>
                    <Text style={styles.gameTitle}>Truth/Dare</Text>
                    <Text style={styles.gameDesc}>Random fun prompts</Text>
                  </TouchableOpacity>

                  {/* FLAMES */}
                  <TouchableOpacity style={styles.gameCard} onPress={() => router.push('/flames')}>
                    <View style={[styles.gameIconBox, { backgroundColor: '#EF4444' }]}>
                      <Ionicons name="heart" size={28} color={COLORS.white} />
                    </View>
                    <Text style={styles.gameTitle}>FLAMES</Text>
                    <Text style={styles.gameDesc}>Relationship match</Text>
                  </TouchableOpacity>

                </View>

                {/* ABOUT APP BUTTON */}
                <TouchableOpacity 
                  style={[styles.bellScheduleCard, { marginTop: 10, marginBottom: 40, backgroundColor: COLORS.primary }]} 
                  onPress={() => router.push('/about')}
                  activeOpacity={0.9}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="information-circle" size={24} color={COLORS.white} />
                    </View>
                    <View style={{ marginLeft: 16, flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.white }}>About Sairam Hub</Text>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Version 1.0, Features & Credits</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                  </View>
                </TouchableOpacity>

              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* MANAGE SCHEDULE MODAL */}
      <Modal visible={isManageModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Schedule</Text>
              <TouchableOpacity onPress={() => setIsManageModalVisible(false)} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {bellSchedule.map((p, i) => (
                <View key={i} style={styles.modalPeriodRow}>
                  <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{p.name}</Text>
                    <Text style={{ color: COLORS.textSecondary }}>
                      {`${p.startH.toString().padStart(2,'0')}:${p.startM.toString().padStart(2,'0')} - ${p.endH.toString().padStart(2,'0')}:${p.endM.toString().padStart(2,'0')}`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deletePeriod(i)} style={{ padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 }}>
                    <Ionicons name="trash" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.modalAddContainer}>
                <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>Add New Period</Text>
                <TextInput placeholder="Period Name (e.g. Period 1, Lunch)" style={styles.modalInput} value={newPeriod.name} onChangeText={(t) => setNewPeriod({...newPeriod, name: t})} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput placeholder="Start H (24hr)" style={[styles.modalInput, { flex: 1 }]} keyboardType="numeric" value={newPeriod.startH} onChangeText={(t) => setNewPeriod({...newPeriod, startH: t})} />
                  <TextInput placeholder="Start M" style={[styles.modalInput, { flex: 1 }]} keyboardType="numeric" value={newPeriod.startM} onChangeText={(t) => setNewPeriod({...newPeriod, startM: t})} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput placeholder="End H (24hr)" style={[styles.modalInput, { flex: 1 }]} keyboardType="numeric" value={newPeriod.endH} onChangeText={(t) => setNewPeriod({...newPeriod, endH: t})} />
                  <TextInput placeholder="End M" style={[styles.modalInput, { flex: 1 }]} keyboardType="numeric" value={newPeriod.endM} onChangeText={(t) => setNewPeriod({...newPeriod, endM: t})} />
                </View>
                <TouchableOpacity onPress={addPeriod} style={styles.modalAddBtn}>
                  <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>+ Add to Schedule</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/share')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
        <Text style={styles.fabLabel}>Share Material</Text>
      </TouchableOpacity>

      {/* BOTTOM TAB BAR */}
      <View style={styles.tabBar}>
        <TabItem tabName="home" label="Home" iconName="home" />
        <TabItem tabName="materials" label="Materials" iconName="book" />
        <TabItem tabName="career" label="Career Hub" iconName="rocket" />
        <TabItem tabName="updates" label="Updates" iconName="notifications" />
        <TabItem tabName="more" label="More" iconName="apps" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    fontFamily: 'System',
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
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.purpleLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
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
    fontSize: 14,
  },
  tabContent: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchPlaceholder: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  horizontalScroll: {
    marginBottom: 16,
  },
  horizontalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 110,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  careerIcon: {
    marginBottom: 8,
  },
  careerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
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
  emptyRecentBox: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyRecentText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  tabHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  tabHeaderSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  semesterGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  semesterGridCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  semesterIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  semesterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  semesterExploreText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  careerHubCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  careerHubCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  careerHubIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  careerHubTextContainer: {
    flex: 1,
  },
  careerHubTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  careerHubDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  announcementTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  announcementTabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    marginRight: 8,
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
  fab: {
    position: 'absolute',
    bottom: 76,
    right: 16,
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  fabLabel: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  fabPulse: {
    backgroundColor: COLORS.secondary,
    opacity: 0.6,
  },
  tabBar: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  tabItemText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  todoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  todoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  todoInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.text,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  todoAddButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoAddButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  todoRowClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  todoDeleteButton: {
    padding: 4,
  },
  todoText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  needToReadContainer: {
    marginBottom: 20,
  },
  needToReadCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  needToReadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  needToReadTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  needToReadTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B21A8',
    flex: 1,
  },
  readBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  needToReadDesc: {
    fontSize: 12,
    color: '#701A75',
    lineHeight: 18,
  },
  bellScheduleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  bellHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bellTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 6,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  bellInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bellCurrentBox: {
    flex: 1,
  },
  bellSubLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bellCurrentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  bellTimeLeft: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bellDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  bellNextBox: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bellNextName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
    textAlign: 'right',
  },
  bellNextTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bellProgressBarContainer: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bellProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalPeriodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalAddContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    color: COLORS.text,
  },
  modalAddBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  featureGridCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  featureIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureGridTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  featureGridDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  gameCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gameIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  gameDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
