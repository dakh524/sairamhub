import axios from 'axios';
import { Material } from '../types/material';

const SHEET_ID = process.env.EXPO_PUBLIC_SHEET_ID || '1R0-BcZKHChSXEJTklyxAwntz69dxitRSQDuzBFaQzq4';
const API_KEY = process.env.EXPO_PUBLIC_SHEETS_API_KEY || 'AIzaSyCExE7m5_M_wfptUe-3TiJb3OysGNlFbUc';

if (!process.env.EXPO_PUBLIC_SHEET_ID || !process.env.EXPO_PUBLIC_SHEETS_API_KEY) {
  console.warn('Warning: EXPO_PUBLIC_SHEET_ID or EXPO_PUBLIC_SHEETS_API_KEY is not defined in environment variables. Using hardcoded fallback values.');
}

// In-memory cache
let cachedMaterials: Material[] | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION_MS = 0; // Disabled cache for live testing

// Helper to normalize semester strings (e.g. "FIRST SEM" -> "1")
function normalizeSemester(sem: string): string {
  const s = sem.toUpperCase().trim();
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

/**
 * Fetch all materials from Google Sheet.
 */
export async function fetchAllMaterials(): Promise<Material[]> {
  const now = Date.now();
  if (cachedMaterials && now < cacheExpiry) {
    return cachedMaterials;
  }

  // Google Sheets API endpoint
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Form%20Responses%201!A2:L?key=${API_KEY}`;
  
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const rows = response.data.values;
    
    let sheetMaterials: Material[] = [];
    if (rows && rows.length > 0) {
      sheetMaterials = rows.map((row: any[]) => {
        const rawSem = row[2] ? String(row[2]).trim() : '1';
        const sem = normalizeSemester(rawSem);
        return {
          year: row[1] ? String(row[1]).trim() : getYearFromSem(sem),
          sem: sem,
          dept: row[3] ? String(row[3]).trim() : 'CSE',
          subject: row[9] ? String(row[9]).trim() : 'General Resources',
          level: 'Subject',
          material_type: row[4] ? toTitleCase(String(row[4]).trim()) : 'Notes',
          title: row[5] ? String(row[5]).trim() : 'Material Document',
          drive_link: row[6] ? String(row[6]).replace(/^"|"$/g, '').trim() : 'https://drive.google.com',
          contributor_name: row[7] ? String(row[7]).trim() : 'Sairam Student',
          date: row[8] ? String(row[8]).trim() : (row[0] ? String(row[0]).split(' ')[0] : 'Today'),
          approved: row[11] ? String(row[11]).trim() : 'NO'
        };
      });
    }

    const approvedMaterials = sheetMaterials.filter(m => m.approved.toUpperCase() === 'YES');
    
    cachedMaterials = approvedMaterials;
    cacheExpiry = now + CACHE_DURATION_MS;
    
    return approvedMaterials;
  } catch (error) {
    console.error('Error fetching materials from database:', error);
    throw new Error('Database Error');
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
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet2!A2:D?key=${API_KEY}`;
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const rows = response.data.values;
    if (!rows) return [];
    
    return rows.map((row: any[], index: number) => ({
      id: String(index),
      title: row[0] ? String(row[0]).trim() : '',
      desc: row[1] ? String(row[1]).substring(0, 50) + '...' : '',
      details: row[1] ? String(row[1]).trim() : '',
      link: row[2] ? String(row[2]).trim() : '',
      date: row[3] ? String(row[3]).trim() : 'Today',
      type: 'announcements',
      venue: 'Sairam Hub',
    })).filter((a: any) => a.title !== '');
  } catch (error) {
    console.error('Error fetching announcements from database:', error);
    throw new Error('Database Error');
  }
}

/**
 * Submit shared material to Google Sheet via Google Apps Script Web App.
 */
export async function submitSharedMaterial(data: {
  name: string;
  dept: string;
  year: string;
  sem: string;
  subject: string;
  type: string;
  title: string;
  link: string;
  email: string;
}): Promise<boolean> {
  const url = process.env.EXPO_PUBLIC_SUBMIT_URL || '';
  if (!url) {
    console.warn('Warning: EXPO_PUBLIC_SUBMIT_URL is not defined in environment variables. Submission will fail.');
    throw new Error('Submission URL not configured. Please set EXPO_PUBLIC_SUBMIT_URL in .env');
  }

  try {
    const response = await axios.post(url, JSON.stringify(data), {
      headers: {
        'Content-Type': 'text/plain',
      },
      timeout: 15000,
    });
    
    return response.data && response.data.status === 'success';
  } catch (error: any) {
    console.error('Error submitting material:', error);
    throw new Error(error.response?.data?.message || error.message || 'Submission failed');
  }
}

