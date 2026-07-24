import { supabase } from './supabase';
import { Material } from '../types/material';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory cache
let cachedMaterials: Material[] | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache for production

// Helper to normalize semester strings (e.g. "FIRST SEM" -> "1")
function normalizeSemester(sem: string): string {
  if (!sem) return '1';
  const s = String(sem).toUpperCase().trim();
  if (s.includes('FIRST') || s.includes('1ST') || s === '1') return '1';
  if (s.includes('SECOND') || s.includes('2ND') || s === '2') return '2';
  if (s.includes('THIRD') || s.includes('3RD') || s === '3') return '3';
  if (s.includes('FOURTH') || s.includes('4TH') || s === '4') return '4';
  if (s.includes('FIFTH') || s.includes('5TH') || s === '5') return '5';
  if (s.includes('SIXTH') || s.includes('6TH') || s === '6') return '6';
  if (s.includes('SEVENTH') || s.includes('7TH') || s === '7') return '7';
  if (s.includes('EIGHTH') || s.includes('8TH') || s === '8') return '8';
  
  const match = s.match(/\d+/);
  if (match) return match[0];
  return s;
}

// Helper to format string to Title Case
function toTitleCase(str: string): string {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// Helper to determine year from semester
function getYearFromSem(sem: string): string {
  const s = parseInt(sem, 10);
  if (s <= 2) return '1st Year';
  if (s <= 4) return '2nd Year';
  if (s <= 6) return '3rd Year';
  return '4th Year';
}

export function clearMaterialsCache() {
  cachedMaterials = null;
  cacheExpiry = 0;
}

/**
 * Fetch all materials from Supabase and local storage fallback.
 */
export async function fetchAllMaterials(): Promise<Material[]> {
  const now = Date.now();
  if (cachedMaterials && now < cacheExpiry) {
    return cachedMaterials;
  }

  try {
    // 1. Try to load from offline cache first if in-memory is empty
    if (!cachedMaterials) {
      try {
        const offlineData = await AsyncStorage.getItem('offline_materials');
        if (offlineData) {
          cachedMaterials = JSON.parse(offlineData);
          // Don't set expiry, let it fetch in background or next time
        }
      } catch (e) {
        console.warn('Offline cache read error', e);
      }
    }

    // Query both Supabase tables in parallel
    const [matsRes, sharedRes] = await Promise.all([
      supabase.from('materials').select('*'),
      supabase.from('shared_materials').select('*')
    ]);

    const matsData = matsRes.data || [];
    const sharedData = sharedRes.data || [];

    const materialsFromTable: Material[] = matsData.map(row => {
      const sem = normalizeSemester(row.sem);
      return {
        year: row.year || getYearFromSem(sem),
        sem: sem,
        dept: row.dept ? row.dept.toUpperCase().trim() : 'CSE',
        subject: row.subject ? toTitleCase(row.subject.trim()) : 'General Resources',
        level: 'Subject',
        material_type: row.material_type ? toTitleCase(row.material_type) : (row.type ? toTitleCase(row.type) : 'Notes'),
        title: row.title || 'Material Document',
        drive_link: row.drive_link ? row.drive_link.replace(/^"|"$/g, '').trim() : (row.link || 'https://drive.google.com'),
        contributor_name: row.contributor_name || 'Sairam Student',
        date: row.date || 'Today',
        approved: 'YES',
        id: row.id ? String(row.id) : undefined,
        sourceTable: 'materials'
      };
    });

    const materialsFromShared: Material[] = sharedData.map(row => {
      const sem = normalizeSemester(row.sem);
      return {
        year: row.year || getYearFromSem(sem),
        sem: sem,
        dept: row.dept ? row.dept.toUpperCase().trim() : 'CSE',
        subject: row.subject ? toTitleCase(row.subject.trim()) : 'General Resources',
        level: 'Subject',
        material_type: row.type ? toTitleCase(row.type.trim()) : 'Notes',
        title: row.title || 'Material Document',
        drive_link: row.link ? row.link.replace(/^"|"$/g, '').trim() : 'https://drive.google.com',
        contributor_name: row.name || 'Sairam Student',
        date: row.date || 'Just now',
        approved: 'YES',
        id: row.id ? String(row.id) : undefined,
        sourceTable: 'shared_materials'
      };
    });

    // Also fetch local user-submitted materials fallback from AsyncStorage
    let localShared: Material[] = [];
    try {
      const rawLocal = await AsyncStorage.getItem('local_shared_materials');
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        localShared = parsed.map((row: any) => {
          const sem = normalizeSemester(row.sem);
          return {
            year: row.year || getYearFromSem(sem),
            sem: sem,
            dept: row.dept ? row.dept.toUpperCase().trim() : 'CSE',
            subject: row.subject ? toTitleCase(row.subject.trim()) : 'General Resources',
            level: 'Subject',
            material_type: row.type ? toTitleCase(row.type.trim()) : 'Notes',
            title: row.title || 'Material Document',
            drive_link: row.link ? row.link.replace(/^"|"$/g, '').trim() : 'https://drive.google.com',
            contributor_name: row.name || 'Sairam Student',
            date: row.date || 'Just now',
            approved: 'YES'
          };
        });
      }
    } catch (e) {
      console.warn('Error reading local_shared_materials:', e);
    }

    // Merge and de-duplicate by title + drive_link + sem + dept
    const rawCombined = [...materialsFromTable, ...materialsFromShared, ...localShared];
    const uniqueMap = new Map<string, Material>();
    
    rawCombined.forEach(m => {
      const key = `${m.dept.toUpperCase()}_${m.sem}_${m.subject.toLowerCase()}_${m.title.toLowerCase()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, m);
      }
    });

    const combined = Array.from(uniqueMap.values());

    cachedMaterials = combined;
    cacheExpiry = Date.now() + CACHE_DURATION_MS;

    // Save for offline
    AsyncStorage.setItem('offline_materials', JSON.stringify(combined)).catch(() => {});

    return combined;
  } catch (error) {
    console.warn('Warning fetching materials:', error);
    return [];
  }
}

/**
 * Filter materials by department, semester and subject
 */
export function getSubjectMaterials(
  data: Material[],
  dept: string,
  sem: string,
  subject: string
): Material[] {
  return data.filter(
    item =>
      (item.dept.toUpperCase() === dept.toUpperCase() || item.dept.toUpperCase() === 'COMMON' || item.dept.toUpperCase() === 'ALL') &&
      String(item.sem) === String(sem) &&
      item.subject.toLowerCase() === subject.toLowerCase()
  );
}

export async function fetchAnnouncements(): Promise<any[]> {
  try {
    let offlineData: any[] = [];
    try {
      const rawOffline = await AsyncStorage.getItem('offline_announcements');
      if (rawOffline) offlineData = JSON.parse(rawOffline);
    } catch (e) {}

    const { data, error } = await supabase
      .from('announcements')
      .select('*');

    const dbAnnouncements = (data || []).map((row) => ({
      id: String(row.id),
      title: row.title || '',
      desc: row.desc ? row.desc.substring(0, 80) + '...' : '',
      details: row.details || row.desc || '',
      link: row.link || '',
      date: row.date || 'Just now',
      type: 'announcements',
      venue: 'Sairam Hub',
    })).filter((a: any) => a.title !== '');

    let localAnnouncements: any[] = [];
    try {
      const rawLocal = await AsyncStorage.getItem('local_announcements');
      if (rawLocal) {
        localAnnouncements = JSON.parse(rawLocal);
      }
    } catch (e) {
      console.warn('Error reading local_announcements:', e);
    }

    const merged = [...offlineData, ...dbAnnouncements, ...localAnnouncements];
    const uniqueAnns = Array.from(new Map(merged.map(a => [a.title + a.date, a])).values());
    
    // Save for offline
    AsyncStorage.setItem('offline_announcements', JSON.stringify(uniqueAnns)).catch(() => {});

    return uniqueAnns;
  } catch (error) {
    console.warn('Warning fetching announcements:', error);
    return [];
  }
}

/**
 * Submit shared material to Supabase & Local Fallback.
 */
export async function submitSharedMaterial(data: {
  name: string;
  dept: string;
  year: string;
  sem: string;
  subject: string;
  level?: string;
  type: string;
  title: string;
  link: string;
  email: string;
}): Promise<boolean> {
  try {
    const deptUpper = data.dept ? data.dept.toUpperCase().trim() : 'CSE';
    const semNormalized = normalizeSemester(data.sem);
    const subjectFormatted = toTitleCase(data.subject.trim());
    const typeFormatted = toTitleCase(data.type.trim());

    const newItem = {
      name: data.name,
      dept: deptUpper,
      year: data.year || getYearFromSem(semNormalized),
      sem: semNormalized,
      subject: subjectFormatted,
      type: typeFormatted,
      title: data.title,
      link: data.link,
      email: data.email,
      date: 'Just now'
    };

    // 1. Immediately persist to AsyncStorage for 100% instant availability
    try {
      const existing = await AsyncStorage.getItem('local_shared_materials');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newItem);
      await AsyncStorage.setItem('local_shared_materials', JSON.stringify(list));
    } catch (err) {
      console.warn('AsyncStorage save error:', err);
    }

    // 2. Try inserting into Supabase shared_materials table
    try {
      await supabase
        .from('shared_materials')
        .insert([{
          name: data.name,
          dept: deptUpper,
          year: newItem.year,
          sem: semNormalized,
          subject: subjectFormatted,
          type: typeFormatted,
          title: data.title,
          link: data.link,
          email: data.email
        }]);
    } catch (sharedErr) {
      console.warn('shared_materials Supabase insert warning:', sharedErr);
    }
    
    // Clear in-memory cache immediately
    clearMaterialsCache();
    
    return true;
  } catch (error: any) {
    console.error('Error submitting material:', error);
    throw new Error(error.message || 'Submission failed');
  }
}

/**
 * ADMIN: Delete a material from either 'materials' or 'shared_materials' table
 */
export async function deleteMaterial(id: string, sourceTable: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(sourceTable)
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Clear cache to refresh the list
    clearMaterialsCache();
    return true;
  } catch (err) {
    console.error('Failed to delete material:', err);
    return false;
  }
}

/**
 * ADMIN: Update a material's details
 */
export async function updateMaterial(id: string, sourceTable: string, updates: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(sourceTable)
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    
    clearMaterialsCache();
    return true;
  } catch (err) {
    console.error('Failed to update material:', err);
    return false;
  }
}

/**
 * ADMIN: Add a new YouTube video link
 */
export async function addCareerVideo(data: {
  category: string;
  title: string;
  videoId?: string;
  playlistId?: string;
  language: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('career_videos')
      .insert([{
        category: data.category,
        title: data.title,
        video_id: data.videoId || null,
        playlist_id: data.playlistId || null,
        language: data.language
      }]);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to add career video:', err);
    return false;
  }
}

/**
 * ADMIN: Get basic app statistics (Users, Materials)
 */
export async function getAppStats(): Promise<{ totalUsers: number; totalMaterials: number; totalDrives: number }> {
  try {
    const [devicesRes, matsRes, sharedRes, drivesRes] = await Promise.all([
      supabase.from('app_devices').select('device_id', { count: 'exact', head: true }),
      supabase.from('materials').select('id', { count: 'exact', head: true }),
      supabase.from('shared_materials').select('id', { count: 'exact', head: true }),
      supabase.from('company_drives').select('id', { count: 'exact', head: true })
    ]);

    return {
      totalUsers: devicesRes.count || 0,
      totalMaterials: (matsRes.count || 0) + (sharedRes.count || 0),
      totalDrives: drivesRes.count || 0
    };
  } catch (err) {
    console.error('Failed to fetch app stats:', err);
    return { totalUsers: 0, totalMaterials: 0, totalDrives: 0 };
  }
}

/**
 * ADMIN: Delete an announcement
 */
export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete announcement:', err);
    return false;
  }
}

/**
 * ADMIN: Update an announcement
 */
export async function updateAnnouncement(id: string, updates: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to update announcement:', err);
    return false;
  }
}
