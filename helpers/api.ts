import { supabase } from './supabase';
import { Material } from '../types/material';

// In-memory cache
let cachedMaterials: Material[] | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION_MS = 0; // Disabled cache for live testing

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
 * Fetch all materials from Supabase (combines materials & shared_materials).
 */
export async function fetchAllMaterials(): Promise<Material[]> {
  const now = Date.now();
  if (cachedMaterials && now < cacheExpiry) {
    return cachedMaterials;
  }

  try {
    // Query both tables in parallel
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
        dept: row.dept || 'CSE',
        subject: row.subject || 'General Resources',
        level: 'Subject',
        material_type: row.material_type ? toTitleCase(row.material_type) : (row.type ? toTitleCase(row.type) : 'Notes'),
        title: row.title || 'Material Document',
        drive_link: row.drive_link ? row.drive_link.replace(/^"|"$/g, '').trim() : (row.link || 'https://drive.google.com'),
        contributor_name: row.contributor_name || 'Sairam Student',
        date: row.date || 'Today',
        approved: 'YES'
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
        approved: 'YES'
      };
    });

    const combined = [...materialsFromTable, ...materialsFromShared];

    cachedMaterials = combined;
    cacheExpiry = now + CACHE_DURATION_MS;

    return combined;
  } catch (error) {
    console.warn('Warning fetching materials from database:', error);
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
      item.dept.toUpperCase() === dept.toUpperCase() &&
      String(item.sem) === String(sem) &&
      item.subject.toLowerCase() === subject.toLowerCase()
  );
}

export async function fetchAnnouncements(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*');

    if (error) {
      throw error;
    }

    if (!data) return [];
    
    return data.map((row) => ({
      id: String(row.id),
      title: row.title || '',
      desc: row.desc ? row.desc.substring(0, 80) + '...' : '',
      details: row.details || row.desc || '',
      link: row.link || '',
      date: row.date || 'Just now',
      type: 'announcements',
      venue: 'Sairam Hub',
    })).filter((a: any) => a.title !== '');
  } catch (error) {
    console.warn('Warning fetching announcements from database:', error);
    return [];
  }
}

/**
 * Submit shared material to Supabase.
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

    // 1. Insert into shared_materials
    const { error: sharedErr } = await supabase
      .from('shared_materials')
      .insert([{
        name: data.name,
        dept: deptUpper,
        year: data.year,
        sem: data.sem,
        subject: data.subject,
        type: data.type,
        title: data.title,
        link: data.link,
        email: data.email
      }]);
      
    if (sharedErr) {
      console.warn('shared_materials insert warning:', sharedErr);
    }

    // 2. Insert live notification entry into announcements table
    try {
      await supabase
        .from('announcements')
        .insert([{
          title: `📚 New Upload: ${data.title}`,
          desc: `Shared by ${data.name} for ${data.subject} (${deptUpper} - Sem ${data.sem})`,
          details: `Proud Sairam student ${data.name} shared new ${data.type} ("${data.title}") for ${data.subject} in ${deptUpper} Department, Semester ${data.sem}.`,
          link: data.link,
          date: 'Just now'
        }]);
    } catch (annErr) {
      console.warn('announcements insert notice:', annErr);
    }
    
    // Clear cache immediately after successful submit
    clearMaterialsCache();
    
    return true;
  } catch (error: any) {
    console.error('Error submitting material:', error);
    throw new Error(error.message || 'Submission failed');
  }
}
