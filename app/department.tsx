import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { fetchAllMaterials } from '../helpers/api';

const KNOWN_DEPTS = [
  { code: 'COMMON', name: 'Common for all Branches', icon: 'people-outline', color: '#8B5CF6' },
  { code: 'CSE', name: 'Computer Science & Engineering', icon: 'code-slash-outline', color: '#3B82F6' },
  { code: 'ECE', name: 'Electronics & Communication Engineering', icon: 'hardware-chip-outline', color: '#EC4899' },
  { code: 'MECH', name: 'Mechanical Engineering', icon: 'settings-outline', color: '#4B5563' },
  { code: 'IT', name: 'Information Technology', icon: 'globe-outline', color: '#10B981' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', icon: 'flash-outline', color: '#F59E0B' },
  { code: 'AI & DS', name: 'Artificial Intelligence & Data Science', icon: 'bar-chart-outline', color: '#06B6D4' },
  { code: 'CSE (AI & ML)', name: 'CSE – AI & Machine Learning', icon: 'eye-outline', color: '#8B5CF6' },
  { code: 'CSBS', name: 'Computer Science & Business Systems', icon: 'briefcase-outline', color: '#6366F1' },
  { code: 'CIVIL', name: 'Civil Engineering', icon: 'business-outline', color: '#14B8A6' },
  { code: 'CCE', name: 'Computer & Communication Engineering', icon: 'git-network-outline', color: '#F43F5E' },
  { code: 'CSE (Cyber Security)', name: 'CSE - Cyber Security', icon: 'shield-checkmark-outline', color: '#EF4444' },
  { code: 'CSE (IoT)', name: 'CSE – Internet of Things', icon: 'pulse-outline', color: '#D946EF' },
  { code: 'EIE', name: 'Electronics & Instrumentation Engineering', icon: 'speedometer-outline', color: '#10B981' },
  { code: 'ICE', name: 'Instrumentation & Control Engineering', icon: 'options-outline', color: '#F43F5E' },
  { code: 'MZ', name: 'Mechatronics', icon: 'cog-outline', color: '#F59E0B' },
  { code: 'MU', name: 'Mechatronics / M&U', icon: 'build-outline', color: '#4B5563' },
  { code: 'MBA', name: 'Master of Business Administration', icon: 'trending-up-outline', color: '#8B5CF6' },
  { code: 'M.Tech CSE', name: 'M.Tech CSE', icon: 'school-outline', color: '#3B82F6' },
  { code: 'H & S', name: 'Humanities & Sciences', icon: 'book-outline', color: '#14B8A6' },
];

export default function DepartmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sem = params.sem as string;
  const resourceType = params.type as string; // Quick access filter passed down

  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDeptPress = (deptCode: string) => {
    router.push({
      pathname: '/subject',
      params: { sem, dept: deptCode, type: resourceType || '' },
    });
  };

  useEffect(() => {
    async function loadDepts() {
      try {
        const mats = await fetchAllMaterials();
        
        // Find all unique departments across the entire database
        const allSheetDepts = Array.from(new Set(mats.map(m => m.dept.toUpperCase())));
        
        // Start with all our known departments so they always show up
        const finalDepts = [...KNOWN_DEPTS];
        
        // Add any custom/new departments found in the database that aren't in the known list
        allSheetDepts.forEach(code => {
          if (!finalDepts.find(d => d.code === code)) {
            finalDepts.push({ code, name: `${code} Department`, icon: 'school-outline', color: '#6B7280' });
          }
        });
        
        // Sort alphabetically but put COMMON first
        finalDepts.sort((a, b) => {
          if (a.code === 'COMMON') return -1;
          if (b.code === 'COMMON') return 1;
          return a.code.localeCompare(b.code);
        });

        setDepartments(finalDepts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDepts();
  }, [sem]);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Department</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subHeader}>
          Semester {sem} • Select your branch
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : departments.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="folder-open-outline" size={48} color={COLORS.textSecondary} />
            <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>No departments found for Semester {sem}</Text>
          </View>
        ) : (
          departments.map((dept) => (
            <TouchableOpacity
              key={dept.code}
              style={styles.card}
              onPress={() => handleDeptPress(dept.code)}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.iconBadge, { backgroundColor: dept.color + '15' }]}>
                  <Ionicons name={dept.icon as any} size={20} color={dept.color} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.deptCode}>{dept.code}</Text>
                  <Text style={styles.deptName} numberOfLines={1}>
                    {dept.name}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  scrollContent: {
    padding: 16,
  },
  subHeader: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  deptCode: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  deptName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
