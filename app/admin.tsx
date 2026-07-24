import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { supabase } from '../helpers/supabase';
import { deleteMaterial, updateMaterial, addCareerVideo, getAppStats, fetchAllMaterials, fetchAnnouncements, deleteAnnouncement, updateAnnouncement } from '../helpers/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Material } from '../types/material';

export default function AdminScreen() {
  const router = useRouter();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'announcements' | 'career'>('overview');

  // --- TAB 1: OVERVIEW STATES ---
  const [stats, setStats] = useState({ totalUsers: 0, totalMaterials: 0, totalDrives: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  // --- TAB 2: MATERIALS STATES ---
  const [materials, setMaterials] = useState<Material[]>([]);
  const [matsLoading, setMatsLoading] = useState(false);
  
  const [editingMat, setEditingMat] = useState<Material | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editSem, setEditSem] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // --- TAB 3: ANNOUNCEMENT STATES ---
  const [adminAnns, setAdminAnns] = useState<any[]>([]);
  const [annsLoading, setAnnsLoading] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annDesc, setAnnDesc] = useState('');
  const [annDetails, setAnnDetails] = useState('');
  const [annLink, setAnnLink] = useState('');
  const [annSubmitting, setAnnSubmitting] = useState(false);

  const [editingAnn, setEditingAnn] = useState<any | null>(null);
  const [editAnnTitle, setEditAnnTitle] = useState('');
  const [editAnnDesc, setEditAnnDesc] = useState('');
  const [editAnnDetails, setEditAnnDetails] = useState('');
  const [editAnnLink, setEditAnnLink] = useState('');
  const [editAnnSubmitting, setEditAnnSubmitting] = useState(false);

  // --- TAB 4: CAREER STATES ---
  // Drive Form
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [submittingDrive, setSubmittingDrive] = useState(false);
  // Video Form
  const [vidCategory, setVidCategory] = useState('Placement');
  const [vidTitle, setVidTitle] = useState('');
  const [vidId, setVidId] = useState('');
  const [vidLang, setVidLang] = useState('English');
  const [submittingVid, setSubmittingVid] = useState(false);

  // -------------------------------------------------------------
  // EFFECTS
  // -------------------------------------------------------------
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'overview') fetchStats();
      if (activeTab === 'materials') fetchMats();
      if (activeTab === 'announcements') fetchAdminAnns();
    }
  }, [activeTab, isAuthenticated]);

  const fetchStats = async () => {
    setStatsLoading(true);
    const data = await getAppStats();
    setStats(data);
    setStatsLoading(false);
  };

  const fetchMats = async () => {
    setMatsLoading(true);
    const data = await fetchAllMaterials();
    setMaterials(data);
    setMatsLoading(false);
  };

  const fetchAdminAnns = async () => {
    setAnnsLoading(true);
    // Fetch directly from DB to get the real UUIDs for editing/deleting
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) {
      setAdminAnns(data);
    }
    setAnnsLoading(false);
  };

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (error) throw error;
      if (data.user) setIsAuthenticated(true);
    } catch (err: any) {
      Alert.alert('Access Denied', err.message || 'Invalid email or password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  const handleDeleteMaterial = async (id: string, sourceTable: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to permanently delete this material?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const success = await deleteMaterial(id, sourceTable);
        if (success) {
          Alert.alert('Deleted', 'Material removed successfully.');
          fetchMats(); // Refresh
        } else {
          Alert.alert('Error', 'Failed to delete material.');
        }
      }}
    ]);
  };

  const handleUpdateMaterial = async () => {
    if (!editingMat || !editingMat.id || !editingMat.sourceTable) return;
    setEditSubmitting(true);
    
    const updates: any = {
      title: editTitle,
      subject: editSubject,
      dept: editDept,
      sem: editSem,
    };
    
    if (editingMat.sourceTable === 'materials') {
      updates.drive_link = editLink;
    } else {
      updates.link = editLink;
    }

    const success = await updateMaterial(editingMat.id, editingMat.sourceTable, updates);
    if (success) {
      Alert.alert('Success', 'Material updated successfully.');
      setEditingMat(null);
      fetchMats();
    } else {
      Alert.alert('Error', 'Failed to update material.');
    }
    setEditSubmitting(false);
  };

  const handleAddAnnouncement = async () => {
    if (!annTitle || !annDesc) {
      Alert.alert('Missing Fields', 'Title and Description are required.');
      return;
    }
    setAnnSubmitting(true);
    try {
      const newAnn = {
        title: annTitle,
        desc: annDesc,
        details: annDetails || annDesc,
        link: annLink || null,
        date: 'Just now'
      };
      
      const { error } = await supabase.from('announcements').insert([newAnn]);
      if (error) throw error;
      
      // Save locally to ensure instant visibility on the admin's device
      try {
        const rawLocal = await AsyncStorage.getItem('local_announcements');
        const list = rawLocal ? JSON.parse(rawLocal) : [];
        list.unshift({ ...newAnn, id: 'local_' + Date.now(), type: 'announcements', venue: 'Sairam Hub' });
        await AsyncStorage.setItem('local_announcements', JSON.stringify(list));
      } catch (e) {
        console.warn('Local save error', e);
      }

      setTimeout(() => {
        Alert.alert('Success', 'Announcement posted globally!');
        fetchAdminAnns(); // Refresh list
      }, 100);
      setAnnTitle(''); setAnnDesc(''); setAnnDetails(''); setAnnLink('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setAnnSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this announcement?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          const success = await deleteAnnouncement(id);
          if (success) {
            Alert.alert('Success', 'Announcement deleted.');
            fetchAdminAnns();
          } else {
            Alert.alert('Error', 'Failed to delete announcement.');
          }
      }}
    ]);
  };

  const handleUpdateAnnouncement = async () => {
    if (!editingAnn) return;
    setEditAnnSubmitting(true);
    
    const updates = {
      title: editAnnTitle,
      "desc": editAnnDesc,
      details: editAnnDetails || editAnnDesc,
      link: editAnnLink || null,
    };

    const success = await updateAnnouncement(editingAnn.id, updates);
    if (success) {
      Alert.alert('Success', 'Announcement updated successfully.');
      setEditingAnn(null);
      fetchAdminAnns();
    } else {
      Alert.alert('Error', 'Failed to update announcement.');
    }
    setEditAnnSubmitting(false);
  };

  const handleAddDrive = async () => {
    if (!company || !role || !date || !link) {
      Alert.alert('Missing Fields', 'Please fill all required drive fields (*)');
      return;
    }
    setSubmittingDrive(true);
    try {
      const { error } = await supabase.from('company_drives').insert([{
        company, role, drive_date: date, link,
        logo_url: logoUrl || 'https://logo.clearbit.com/default.com',
        is_active: true,
      }]);
      if (error) throw error;
      Alert.alert('Success!', 'Company Drive link added.');
      setCompany(''); setRole(''); setDate(''); setLink(''); setLogoUrl('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmittingDrive(false);
    }
  };

  const handleAddVideo = async () => {
    if (!vidTitle || !vidId) {
      Alert.alert('Missing Fields', 'Title and YouTube Video ID are required.');
      return;
    }
    setSubmittingVid(true);
    try {
      const success = await addCareerVideo({
        category: vidCategory,
        title: vidTitle,
        videoId: vidId,
        language: vidLang
      });
      if (success) {
        Alert.alert('Success', 'YouTube video added.');
        setVidTitle(''); setVidId('');
      } else {
        Alert.alert('Error', 'Failed to add video.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmittingVid(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER LOGIN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Access</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.loginContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.loginTitle}>Admin Restricted Area</Text>
          <Text style={styles.loginSub}>Login with your Supabase credentials.</Text>

          <View style={[styles.inputGroup, { width: '100%' }]}>
            <Text style={styles.label}>Admin Email</Text>
            <TextInput style={styles.input} placeholder="admin@sairam.edu.in" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>
          <View style={[styles.inputGroup, { width: '100%', marginBottom: 32 }]}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="Enter Password" placeholderTextColor="#94A3B8" secureTextEntry value={password} onChangeText={setPassword} />
          </View>
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={authLoading}>
            {authLoading ? <ActivityIndicator color="#FFFFFF" /> : <>
              <Text style={styles.loginBtnText}>Secure Login</Text>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // RENDER ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Command Center</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <TouchableOpacity style={[styles.tab, activeTab === 'overview' && styles.activeTab]} onPress={() => setActiveTab('overview')}>
            <Ionicons name="analytics" size={18} color={activeTab === 'overview' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'materials' && styles.activeTab]} onPress={() => setActiveTab('materials')}>
            <Ionicons name="library" size={18} color={activeTab === 'materials' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === 'materials' && styles.activeTabText]}>Materials</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'announcements' && styles.activeTab]} onPress={() => setActiveTab('announcements')}>
            <Ionicons name="megaphone" size={18} color={activeTab === 'announcements' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === 'announcements' && styles.activeTabText]}>Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'career' && styles.activeTab]} onPress={() => setActiveTab('career')}>
            <Ionicons name="briefcase" size={18} color={activeTab === 'career' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === 'career' && styles.activeTabText]}>Career</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          {/* ===================== OVERVIEW TAB ===================== */}
          {activeTab === 'overview' && (
            <View>
              <Text style={styles.sectionTitle}>App Statistics</Text>
              {statsLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <View style={styles.statCard}>
                    <Ionicons name="phone-portrait-outline" size={32} color="#3B82F6" />
                    <Text style={styles.statNumber}>{stats.totalUsers}</Text>
                    <Text style={styles.statLabel}>Unique Devices</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="documents-outline" size={32} color="#10B981" />
                    <Text style={styles.statNumber}>{stats.totalMaterials}</Text>
                    <Text style={styles.statLabel}>Total Materials</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="business-outline" size={32} color="#8B5CF6" />
                    <Text style={styles.statNumber}>{stats.totalDrives}</Text>
                    <Text style={styles.statLabel}>Company Drives</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ===================== MATERIALS TAB ===================== */}
          {activeTab === 'materials' && (
            <View>
              <Text style={styles.sectionTitle}>Moderation Queue</Text>
              <Text style={{ color: '#64748B', marginBottom: 16 }}>Review and remove unrelated uploads.</Text>
              {matsLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
              ) : (
                materials.map((mat, i) => (
                  <View key={i} style={styles.matCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1E293B', marginBottom: 4 }}>{mat.title}</Text>
                      <Text style={{ fontSize: 12, color: '#64748B' }}>By {mat.contributor_name} • {mat.dept} Sem {mat.sem}</Text>
                    </View>
                    {mat.id && mat.sourceTable ? (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity 
                          style={[styles.deleteBtn, { backgroundColor: '#EEF2FF' }]}
                          onPress={() => {
                            setEditingMat(mat);
                            setEditTitle(mat.title);
                            setEditSubject(mat.subject);
                            setEditDept(mat.dept);
                            setEditSem(mat.sem);
                            setEditLink(mat.drive_link);
                          }}
                        >
                          <Ionicons name="pencil-outline" size={18} color="#4F46E5" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deleteBtn}
                          onPress={() => handleDeleteMaterial(mat.id!, mat.sourceTable!)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 10, color: '#94A3B8' }}>Local</Text>
                    )}
                  </View>
                ))
              )}

              {/* Edit Material Modal */}
              <Modal visible={!!editingMat} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                  <View style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Edit Material</Text>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Title</Text>
                      <TextInput style={styles.input} value={editTitle} onChangeText={setEditTitle} />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Subject</Text>
                      <TextInput style={styles.input} value={editSubject} onChangeText={setEditSubject} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Dept</Text>
                        <TextInput style={styles.input} value={editDept} onChangeText={setEditDept} />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Sem</Text>
                        <TextInput style={styles.input} value={editSem} onChangeText={setEditSem} />
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Link</Text>
                      <TextInput style={styles.input} value={editLink} onChangeText={setEditLink} autoCapitalize="none" />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                      <TouchableOpacity style={{ flex: 1, padding: 14, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center' }} onPress={() => setEditingMat(null)}>
                        <Text style={{ fontWeight: 'bold', color: '#64748B' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1, padding: 14, backgroundColor: '#6B5DF6', borderRadius: 12, alignItems: 'center' }} onPress={handleUpdateMaterial} disabled={editSubmitting}>
                        {editSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={{ fontWeight: 'bold', color: '#FFF' }}>Save Changes</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

            </View>
          )}

          {/* ===================== ANNOUNCEMENTS TAB ===================== */}
          {activeTab === 'announcements' && (
            <View>
              <Text style={styles.sectionTitle}>Send Global Alert</Text>
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Title *</Text>
                  <TextInput style={styles.input} placeholder="e.g. Server Maintenance" value={annTitle} onChangeText={setAnnTitle} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Short Description *</Text>
                  <TextInput style={styles.input} placeholder="e.g. App will be down for 1 hr" value={annDesc} onChangeText={setAnnDesc} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Details / Body</Text>
                  <TextInput style={[styles.input, { height: 80 }]} multiline placeholder="Full announcement text..." value={annDetails} onChangeText={setAnnDetails} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Action Link (Optional)</Text>
                  <TextInput style={styles.input} placeholder="https://..." value={annLink} onChangeText={setAnnLink} />
                </View>
                <TouchableOpacity style={styles.submitBtn} onPress={handleAddAnnouncement} disabled={annSubmitting}>
                  {annSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Broadcast Alert</Text>}
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Manage Announcements</Text>
              {annsLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
              ) : adminAnns.length === 0 ? (
                <Text style={{ color: '#64748B' }}>No global announcements yet.</Text>
              ) : (
                adminAnns.map((ann, i) => (
                  <View key={i} style={styles.matCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1E293B', marginBottom: 4 }}>{ann.title}</Text>
                      <Text style={{ fontSize: 12, color: '#64748B' }} numberOfLines={1}>{ann.desc}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity 
                        style={[styles.deleteBtn, { backgroundColor: '#EEF2FF' }]}
                        onPress={() => {
                          setEditingAnn(ann);
                          setEditAnnTitle(ann.title);
                          setEditAnnDesc(ann.desc);
                          setEditAnnDetails(ann.details);
                          setEditAnnLink(ann.link || '');
                        }}
                      >
                        <Ionicons name="pencil-outline" size={18} color="#4F46E5" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteAnnouncement(ann.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              {/* Edit Announcement Modal */}
              <Modal visible={!!editingAnn} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                  <View style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Edit Announcement</Text>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Title</Text>
                      <TextInput style={styles.input} value={editAnnTitle} onChangeText={setEditAnnTitle} />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Short Description</Text>
                      <TextInput style={styles.input} value={editAnnDesc} onChangeText={setEditAnnDesc} />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Details / Body</Text>
                      <TextInput style={[styles.input, { height: 80 }]} multiline value={editAnnDetails} onChangeText={setEditAnnDetails} />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Action Link</Text>
                      <TextInput style={styles.input} value={editAnnLink} onChangeText={setEditAnnLink} autoCapitalize="none" />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                      <TouchableOpacity style={{ flex: 1, padding: 14, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center' }} onPress={() => setEditingAnn(null)}>
                        <Text style={{ fontWeight: 'bold', color: '#64748B' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1, padding: 14, backgroundColor: '#6B5DF6', borderRadius: 12, alignItems: 'center' }} onPress={handleUpdateAnnouncement} disabled={editAnnSubmitting}>
                        {editAnnSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={{ fontWeight: 'bold', color: '#FFF' }}>Save Changes</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

            </View>
          )}

          {/* ===================== CAREER TAB ===================== */}
          {activeTab === 'career' && (
            <View>
              <Text style={styles.sectionTitle}>Manage Placement Drives</Text>
              <View style={[styles.card, { marginBottom: 32 }]}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company Name *</Text>
                  <TextInput style={styles.input} placeholder="e.g. TCS (Ninja)" value={company} onChangeText={setCompany} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Job Role *</Text>
                  <TextInput style={styles.input} placeholder="e.g. Software Engineer" value={role} onChangeText={setRole} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Drive Date *</Text>
                  <TextInput style={styles.input} placeholder="e.g. 25 Aug 2026" value={date} onChangeText={setDate} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Application Link *</Text>
                  <TextInput style={styles.input} placeholder="https://..." value={link} onChangeText={setLink} autoCapitalize="none" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Logo URL (Optional)</Text>
                  <TextInput style={styles.input} placeholder="https://logo.clearbit.com/tcs.com" value={logoUrl} onChangeText={setLogoUrl} autoCapitalize="none" />
                </View>
                <TouchableOpacity style={styles.submitBtn} onPress={handleAddDrive} disabled={submittingDrive}>
                  {submittingDrive ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Add Drive Link</Text>}
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Add YouTube Video</Text>
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {['Placement', 'Aptitude', 'Coding', 'GATE'].map(cat => (
                      <TouchableOpacity 
                        key={cat} 
                        onPress={() => setVidCategory(cat)}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: vidCategory === cat ? '#6B5DF6' : '#EEF2FF' }}
                      >
                        <Text style={{ color: vidCategory === cat ? '#FFF' : '#4F46E5', fontSize: 12, fontWeight: 'bold' }}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Video Title *</Text>
                  <TextInput style={styles.input} placeholder="e.g. Quants Foundation" value={vidTitle} onChangeText={setVidTitle} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>YouTube Video ID *</Text>
                  <TextInput style={styles.input} placeholder="e.g. vxHUFFiT0OI" value={vidId} onChangeText={setVidId} autoCapitalize="none" />
                </View>
                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#EF4444' }]} onPress={handleAddVideo} disabled={submittingVid}>
                  {submittingVid ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Publish Video</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  tabContainer: { backgroundColor: '#FFFFFF', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 12 },
  activeTab: { backgroundColor: '#0F172A' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#FFFFFF' },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  loginTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  loginSub: { fontSize: 14, color: '#64748B', marginBottom: 32 },
  loginBtn: { backgroundColor: '#0F172A', width: '100%', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1E293B' },
  submitBtn: { backgroundColor: '#6B5DF6', width: '100%', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  statCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statNumber: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginTop: 12, marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  matCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  deleteBtn: { padding: 10, backgroundColor: '#FEF2F2', borderRadius: 12 }
});
