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
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

// Removed Image.resolveAssetSource due to React Native Web incompatibility

import { fetchAllMaterials, fetchAnnouncements } from '../helpers/api';
import { registerForPushNotificationsAsync, scheduleLocalNotification } from '../helpers/notifications';
import { Material, Announcement } from '../types/material';
import { supabase } from '../helpers/supabase';

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

const MOTIVATIONAL_QUOTES = [
  { 
    quote: "The secret of getting ahead is getting started.", 
    author: "Mark Twain", 
    category: "Mindset",
    bg: require('../assets/images/quote_bg_1.png')
  },
  { 
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", 
    author: "Winston Churchill", 
    category: "Perseverance",
    bg: require('../assets/images/quote_bg_2.png')
  },
  { 
    quote: "Small daily improvements over time lead to stunning results.", 
    author: "Robin Sharma", 
    category: "Consistency",
    bg: require('../assets/images/quote_bg_3.png')
  },
  { 
    quote: "Your focus determines your reality. Master your skills step by step.", 
    author: "Sairam Hub", 
    category: "Focus",
    bg: require('../assets/images/quote_bg_1.png')
  },
  { 
    quote: "The expert in anything was once a beginner. Keep learning!", 
    author: "Helen Hayes", 
    category: "Growth",
    bg: require('../assets/images/quote_bg_2.png')
  },
  { 
    quote: "Push yourself, because no one else is going to do it for you.", 
    author: "Motivation", 
    category: "Drive",
    bg: require('../assets/images/quote_bg_3.png')
  },
  { 
    quote: "Knowledge is power. Information is liberating. Education is the premise of progress.", 
    author: "Kofi Annan", 
    category: "Education",
    bg: require('../assets/images/quote_bg_1.png')
  },
];

const COMPANY_DRIVE_LINKS = [
  { id: '1', company: 'TCS (Ninja/Digital)', role: 'Software Engineer', date: '25 Aug 2026', link: 'https://www.tcs.com/careers', logo: 'https://logo.clearbit.com/tcs.com' },
  { id: '2', company: 'Zoho Corporation', role: 'Member Technical Staff', date: '02 Sep 2026', link: 'https://careers.zohocorp.com', logo: 'https://logo.clearbit.com/zohocorp.com' },
  { id: '3', company: 'Cognizant (GenC)', role: 'Programmer Analyst', date: '15 Sep 2026', link: 'https://careers.cognizant.com', logo: 'https://logo.clearbit.com/cognizant.com' },
  { id: '4', company: 'Wipro (Elite)', role: 'Project Engineer', date: 'Coming Soon', link: 'https://careers.wipro.com', logo: 'https://logo.clearbit.com/wipro.com' },
];

export default function MainApp() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'home' | 'materials' | 'career' | 'updates' | 'more'>('home');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [serverError, setServerError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 6000);
    return () => clearInterval(quoteTimer);
  }, []);

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

  const [userName, setUserName] = useState<string>('Future Engineer');
  const [userDept, setUserDept] = useState<string>('');

  useEffect(() => {
    async function loadUserData() {
      try {
        const name = await AsyncStorage.getItem('userName');
        const dept = await AsyncStorage.getItem('userDept');
        if (name) setUserName(name);
        if (dept) setUserDept(dept);

        // TRACK UNIQUE DEVICE FOR ADMIN STATS
        let deviceId = await AsyncStorage.getItem('device_id');
        if (!deviceId) {
          deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          await AsyncStorage.setItem('device_id', deviceId);
        }
        
        // Upsert to Supabase
        await supabase.from('app_devices').upsert({
          device_id: deviceId,
          last_active: new Date().toISOString()
        }, { onConflict: 'device_id' });
        
      } catch (err) {
        console.error('Failed to load user info or track device:', err);
      }
    }
    loadUserData();
  }, []);

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
                {/* ENERGETIC WELCOME GREETING */}
                <View style={styles.proWelcomeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.proWelcomeTitle}>Let's Crush It, {userName}! 🚀</Text>
                    <Text style={styles.proWelcomeSubtitle}>
                      {userDept ? `${userDept} Department • ` : ''}Sairam Hub Learning Portal
                    </Text>
                  </View>
                  <View style={styles.userAvatarBadgeGlow}>
                    <Image 
                      source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(userName)}&backgroundColor=b6e3f4` }} 
                      style={{ width: '100%', height: '100%', borderRadius: 22 }} 
                    />
                  </View>
                </View>

                {/* SAIRAM HUB HIGHLIGHTS TICKER */}
                <View style={styles.momentumBar}>
                  <View style={styles.momentumItem}>
                    <Ionicons name="library" size={16} color="#3B82F6" />
                    <Text style={styles.momentumText}>{materials.length > 0 ? `${materials.length}+` : '500+'} Materials</Text>
                  </View>
                  <View style={styles.momentumDivider} />
                  <View style={styles.momentumItem}>
                    <Ionicons name="school" size={16} color="#8B5CF6" />
                    <Text style={styles.momentumText}>All Semesters</Text>
                  </View>
                  <View style={styles.momentumDivider} />
                  <View style={styles.momentumItem}>
                    <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                    <Text style={styles.momentumText}>Verified Notes</Text>
                  </View>
                </View>

                {/* PRO SEARCH BAR */}
                <TouchableOpacity
                  style={styles.proSearchBar}
                  onPress={() => router.push('/search')}
                  activeOpacity={0.9}
                >
                  <Ionicons name="search" size={20} color="#7C3AED" style={{ marginRight: 10 }} />
                  <Text style={styles.proSearchPlaceholder}>Search subjects, materials, PYQs...</Text>
                  <View style={styles.searchFilterBadge}>
                    <Ionicons name="options" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>

                {/* PREMIERE GEMINI MOTIVATIONAL HERO CARD */}
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={() => setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
                  style={{ marginBottom: 20 }}
                >
                  <ImageBackground
                    source={MOTIVATIONAL_QUOTES[quoteIndex].bg}
                    style={{
                      width: '100%',
                      minHeight: 180,
                      borderRadius: 24,
                      overflow: 'hidden',
                      padding: 20,
                      justifyContent: 'space-between',
                      shadowColor: '#4F46E5',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.35,
                      shadowRadius: 15,
                      elevation: 8,
                    }}
                    imageStyle={{ borderRadius: 24, resizeMode: 'cover' }}
                  >
                    {/* DARK GLASSMORPHISM OVERLAY */}
                    <LinearGradient
                      colors={['rgba(15, 23, 42, 0.65)', 'rgba(30, 27, 75, 0.85)']}
                      style={{
                        ...StyleSheet.absoluteFill,
                        borderRadius: 24,
                      }}
                    />

                    {/* TOP BADGE ROW */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                        <Ionicons name="sparkles" size={14} color="#FDE047" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
                          DAILY MOTIVATION • {MOTIVATIONAL_QUOTES[quoteIndex].category.toUpperCase()}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        onPress={() => setIsManageModalVisible(true)}
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                      >
                        <Ionicons name="time" size={14} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                          {currentPeriod ? currentPeriod.name : 'Schedule'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* CENTER QUOTE TEXT */}
                    <View style={{ marginVertical: 14, zIndex: 2 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF', lineHeight: 25, fontStyle: 'italic', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>
                        "{MOTIVATIONAL_QUOTES[quoteIndex].quote}"
                      </Text>
                    </View>

                    {/* BOTTOM AUTHOR & SLIDE DOTS ROW */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)' }}>
                        — {MOTIVATIONAL_QUOTES[quoteIndex].author}
                      </Text>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {MOTIVATIONAL_QUOTES.map((_, idx) => (
                          <View
                            key={idx}
                            style={{
                              width: idx === quoteIndex ? 16 : 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: idx === quoteIndex ? '#FDE047' : 'rgba(255, 255, 255, 0.35)',
                            }}
                          />
                        ))}
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>

                {/* VIBRANT QUICK ACTIONS GRID */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickGrid}>
                  <TouchableOpacity 
                    style={styles.quickCardWrapper}
                    onPress={() => setActiveTab('materials')}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#1D4ED8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.quickCardGradient}
                    >
                      <View style={styles.quickIconBoxVibrant}>
                        <Ionicons name="book" size={22} color="#3B82F6" />
                      </View>
                      <Text style={styles.quickCardTitleWhite}>Semesters</Text>
                      <Text style={styles.quickCardSubWhite}>Notes & PYQs</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.quickCardWrapper}
                    onPress={() => router.push('/career')}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#8B5CF6', '#6D28D9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.quickCardGradient}
                    >
                      <View style={styles.quickIconBoxVibrant}>
                        <Ionicons name="rocket" size={22} color="#8B5CF6" />
                      </View>
                      <Text style={styles.quickCardTitleWhite}>Career Hub</Text>
                      <Text style={styles.quickCardSubWhite}>Jobs & Coding</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.quickCardWrapper}
                    onPress={() => router.push('/cgpa')}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#10B981', '#047857']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.quickCardGradient}
                    >
                      <View style={styles.quickIconBoxVibrant}>
                        <Ionicons name="calculator" size={22} color="#10B981" />
                      </View>
                      <Text style={styles.quickCardTitleWhite}>CGPA Calc</Text>
                      <Text style={styles.quickCardSubWhite}>Grade Predictor</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.quickCardWrapper}
                    onPress={() => setActiveTab('more')}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#F59E0B', '#D97706']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.quickCardGradient}
                    >
                      <View style={styles.quickIconBoxVibrant}>
                        <Ionicons name="game-controller" size={22} color="#F59E0B" />
                      </View>
                      <Text style={styles.quickCardTitleWhite}>Fun Zone</Text>
                      <Text style={styles.quickCardSubWhite}>Games & Tools</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* TODAY'S TASKS */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Today's Tasks</Text>
                  <Text style={styles.todoCountBadge}>
                    {todoList.filter(t => t.completed).length}/{todoList.length} Done
                  </Text>
                </View>

                <View style={styles.todoContainer}>
                  {/* PROGRESS LINE */}
                  <View style={styles.todoProgressBarTrack}>
                    <View 
                      style={[
                        styles.todoProgressBarFill, 
                        { width: `${todoList.length ? (todoList.filter(t => t.completed).length / todoList.length) * 100 : 0}%` }
                      ]} 
                    />
                  </View>

                  {/* INPUT ROW */}
                  <View style={styles.todoInputRow}>
                    <TextInput
                      style={styles.todoInput}
                      placeholder="Write a new task..."
                      placeholderTextColor={COLORS.textSecondary}
                      value={newTodoText}
                      onChangeText={setNewTodoText}
                    />
                    <TouchableOpacity style={styles.todoAddButton} onPress={addTodo}>
                      <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 2 }} />
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
                          size={22}
                          color={todo.completed ? "#10B981" : COLORS.primary}
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

                {/* CAREER RESOURCES CAROUSEL */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Career & Skill Hub</Text>
                  <TouchableOpacity onPress={() => router.push('/career')}>
                    <Text style={styles.viewAllText}>View All →</Text>
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
                    onPress={() => Linking.openURL('https://www.dakhedusolutions.in/internship')}
                  >
                    <Ionicons name="paper-plane-outline" size={24} color="#F59E0B" style={styles.careerIcon} />
                    <Text style={styles.careerLabel}>Internships</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* RECENTLY ADDED */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Recently Uploaded</Text>
                  <TouchableOpacity onPress={() => router.push('/search')}>
                    <Text style={styles.viewAllText}>Explore All →</Text>
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
                        <View style={[styles.docTypeBadge, { backgroundColor: item.material_type?.toLowerCase().includes('pyq') ? '#FEF3C7' : '#EEF2FF' }]}>
                          <Ionicons 
                            name={item.material_type?.toLowerCase().includes('pyq') ? "help-circle-outline" : "document-text-outline"} 
                            size={20} 
                            color={item.material_type?.toLowerCase().includes('pyq') ? "#D97706" : COLORS.primary} 
                          />
                        </View>
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

                {/* DYNAMIC MOTIVATIONAL QUOTES BANNER WITH GEMINI AI ART */}
                <TouchableOpacity
                  style={{ marginTop: 24, marginBottom: 90 }}
                  onPress={() => setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={MOTIVATIONAL_QUOTES[quoteIndex].bg}
                    style={{
                      padding: 20,
                      borderRadius: 22,
                      overflow: 'hidden',
                      shadowColor: '#7C3AED',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 14,
                      elevation: 6,
                    }}
                    imageStyle={{ borderRadius: 22, resizeMode: 'cover' }}
                  >
                    <LinearGradient
                      colors={['rgba(15, 23, 42, 0.6)', 'rgba(88, 28, 135, 0.85)']}
                      style={{
                        ...StyleSheet.absoluteFill,
                        borderRadius: 22,
                      }}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, zIndex: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)' }}>
                        <Ionicons name="sparkles" size={14} color="#FDE047" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
                          DAILY MOTIVATION • {MOTIVATIONAL_QUOTES[quoteIndex].category.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="refresh-circle" size={22} color="rgba(255,255,255,0.85)" />
                      </View>
                    </View>

                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF', lineHeight: 23, fontStyle: 'italic', marginBottom: 12, zIndex: 2 }}>
                      "{MOTIVATIONAL_QUOTES[quoteIndex].quote}"
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)' }}>
                        — {MOTIVATIONAL_QUOTES[quoteIndex].author}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                        {MOTIVATIONAL_QUOTES.map((_, idx) => (
                          <View
                            key={idx}
                            style={{
                              width: idx === quoteIndex ? 14 : 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: idx === quoteIndex ? '#FDE047' : 'rgba(255, 255, 255, 0.35)',
                            }}
                          />
                        ))}
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>


              </View>
            )}

            {/* TAB: CAREER HUB */}
            {activeTab === 'career' && (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
                
                {/* 1. HERO BANNER */}
                <LinearGradient
                  colors={['#1E1B4B', '#4C1D95']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 24, padding: 24, marginBottom: 24, position: 'relative', overflow: 'hidden' }}
                >
                  <View style={{ position: 'absolute', right: -20, top: -20, width: 150, height: 150, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 75 }} />
                  <View style={{ position: 'absolute', right: 40, bottom: -40, width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 50 }} />
                  
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Welcome back! 👋</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 12, lineHeight: 32 }}>
                    Your <Text style={{ color: '#C084FC' }}>Career</Text> Journey Starts Here!
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 24, maxWidth: '70%', lineHeight: 20 }}>
                    Top-quality resources to crack placements and competitive exams.
                  </Text>
                  

                </LinearGradient>

                {/* 2. EXPLORE CATEGORIES (2x2 Grid) */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>Explore Categories</Text>
                </View>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
                  {[
                    { title: 'Placement', title2: 'Materials', icon: 'briefcase-outline', desc1: 'Resume, HR Questions', desc2: 'Interview Prep & more', bg: '#EEF2FF', color: '#4F46E5', tint: '#E0E7FF' },
                    { title: 'Aptitude', title2: 'Materials', icon: 'bulb-outline', desc1: 'Quantitative, Reasoning', desc2: 'Verbal & more', bg: '#FDF4FF', color: '#C026D3', tint: '#FAE8FF' },
                    { title: 'GATE', title2: 'Materials', icon: 'school-outline', desc1: 'Formulas, Previous Years', desc2: 'Mock Tests & more', bg: '#FFF7ED', color: '#EA580C', tint: '#FFEDD5' },
                    { title: 'Coding', title2: 'Materials', icon: 'code-slash-outline', desc1: 'C++, Java, DSA', desc2: 'LeetCode & more', bg: '#ECFDF5', color: '#059669', tint: '#D1FAE5' },
                  ].map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{ width: '48%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: item.tint, shadowColor: item.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
                      onPress={() => router.push({ pathname: '/career-detail', params: { category: item.title } })}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: item.bg, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name={item.icon as any} size={22} color={item.color} />
                      </View>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#1F2937' }}>{item.title}</Text>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#1F2937', marginBottom: 8 }}>{item.title2}</Text>
                      <Text style={{ fontSize: 11, color: '#6B7280', lineHeight: 16 }}>{item.desc1}</Text>
                      <Text style={{ fontSize: 11, color: '#6B7280', lineHeight: 16, marginBottom: 16 }}>{item.desc2}</Text>
                      <View style={{ alignSelf: 'flex-end', backgroundColor: item.bg, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="chevron-forward" size={14} color={item.color} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 3. APTITUDE ROADMAP */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>Aptitude Roadmap to Clear</Text>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 32, paddingBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 8 }}>
                    {[
                      { step: '01', title: 'Quants Basics', desc: 'Learn formulas for percentages, profit/loss time/work.', color: '#6366F1' },
                      { step: '02', title: 'Logical Reasoning', desc: 'Practice patterns, syllogisms, and puzzles.', color: '#EC4899' },
                      { step: '03', title: 'Speed & Accuracy', desc: 'Solve questions under 1 minute using shortcuts.', color: '#F59E0B' },
                      { step: '04', title: 'Mock Tests', desc: 'Take full-length mock exams regularly.', color: '#10B981' },
                    ].map((item, idx) => (
                      <View key={idx} style={{ width: 110, alignItems: 'center', marginRight: idx === 3 ? 0 : 20, position: 'relative' }}>
                        {idx !== 3 && (
                          <View style={{ position: 'absolute', top: 22, left: 65, right: -45, height: 2, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB', zIndex: -1 }} />
                        )}
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: item.color, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 4, borderColor: item.color + '20' }}>
                          <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>{item.step}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 4 }}>{item.title}</Text>
                        <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'center', lineHeight: 14 }}>{item.desc}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                {/* 4. COMPANY DRIVE LINKS (ADMIN SECTION) */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>Active Company Drives</Text>
                  <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, color: '#4F46E5', fontWeight: 'bold' }}>Live</Text>
                  </View>
                </View>

                <View style={{ marginBottom: 32 }}>
                  {COMPANY_DRIVE_LINKS.map((item, idx) => (
                    <TouchableOpacity
                      key={item.id}
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        backgroundColor: '#FFFFFF', 
                        padding: 16, 
                        borderRadius: 16, 
                        marginBottom: 12, 
                        borderWidth: 1, 
                        borderColor: '#E2E8F0',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 6,
                        elevation: 2
                      }}
                      onPress={() => Linking.openURL(item.link)}
                    >
                      <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' }}>
                        <Image source={{ uri: item.logo }} style={{ width: 32, height: 32 }} resizeMode="contain" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 }}>{item.company}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="briefcase-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                          <Text style={{ fontSize: 12, color: '#64748B', marginRight: 12 }}>{item.role}</Text>
                          <Ionicons name="calendar-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                          <Text style={{ fontSize: 12, color: '#64748B' }}>{item.date}</Text>
                        </View>
                      </View>
                      <View style={{ backgroundColor: '#F5F3FF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="open-outline" size={16} color="#7C3AED" />
                      </View>
                    </TouchableOpacity>
                  ))}
                  <Text style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 8 }}>
                    *These links will be updated by Admin during placement drives
                  </Text>
                </View>


              </ScrollView>
            )}

            {/* TAB: UPDATES */}
            {activeTab === 'updates' && (
              <View style={styles.tabContent}>
                <Text style={styles.tabHeaderTitle}>Updates & Uploads</Text>
                
                {/* TAB SELECTORS */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.announcementTabs, { marginTop: 12 }]}>
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

                {/* ANNOUNCEMENTS CONTENT */}
                {updateTab === 'announcements' && (
                  <>
                    <Text style={[styles.sectionTitle, { marginTop: 12, marginBottom: 12 }]}>📢 Announcements</Text>
                    {announcements.filter(a => a.type === 'announcements').map((item) => {
                      const getThemeColor = () => {
                        if (item.type === 'workshops') return '#8B5CF6';
                        if (item.title.toLowerCase().includes('important')) return '#EF4444';
                        return '#3B82F6';
                      };
                      const themeColor = getThemeColor();
                      
                      return (
                        <View
                          key={item.id}
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
                          
                          <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'flex-start' }}>
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
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}

                {/* MATERIALS CONTENT */}
                {updateTab === 'all' && (
                  <>
                    <Text style={[styles.sectionTitle, { marginTop: 12 }]}>📂 Latest Document Uploads</Text>
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
                  </>
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
                      <View style={styles.bellLiveDot} />
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
                <TextInput placeholder="Period Name (e.g. Period 1, Lunch)" style={styles.modalInput} value={newPeriod.name} onChangeText={(t: string) => setNewPeriod({...newPeriod, name: t})} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput placeholder="Start H (24hr)" style={[styles.modalInput, { flex: 1 }]} keyboardType="numeric" value={newPeriod.startH} onChangeText={(t: string) => setNewPeriod({...newPeriod, startH: t})} />
                  <TextInput placeholder="Start M" style={[styles.modalInput, { flex: 1 }]} keyboardType="numeric" value={newPeriod.startM} onChangeText={(t: string) => setNewPeriod({...newPeriod, startM: t})} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput placeholder="End H (24hr)" style={[styles.modalInput, { flex: 1 }]} keyboardType="numeric" value={newPeriod.endH} onChangeText={(t: string) => setNewPeriod({...newPeriod, endH: t})} />
                  <TextInput placeholder="End M" style={[styles.modalInput, { flex: 1 }]} keyboardType="numeric" value={newPeriod.endM} onChangeText={(t: string) => setNewPeriod({...newPeriod, endM: t})} />
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
  proWelcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  streakBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  streakBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5E36',
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B5CF6',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  proWelcomeTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  proWelcomeSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  userAvatarBadgeGlow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#818CF8',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },
  momentumBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  momentumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  momentumText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  momentumDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
  },
  proSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  proSearchPlaceholder: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  searchFilterBadge: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
  },
  proHeroCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 9,
  },
  heroTopBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicatorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  heroSettingsBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroPeriodTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroPeriodSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    fontWeight: '600',
  },
  heroProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  heroTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTimeLeftText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  heroActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroActionChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickCardWrapper: {
    width: '48%',
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  quickCardGradient: {
    borderRadius: 18,
    padding: 16,
  },
  quickIconBoxVibrant: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickCardTitleWhite: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  quickCardSubWhite: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontWeight: '600',
  },
  todoCountBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todoProgressBarTrack: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  todoProgressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  docTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    bottom: 75,
    right: 20,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
  },
  fabLabel: {
    fontSize: 14,
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
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  todoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  todoInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  todoAddButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bellLiveDot: {
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
