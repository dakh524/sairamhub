import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function SemesterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedYear = params.year as string;
  const resourceType = params.type as string; // Optional filter passed from home page quick links

  // Determine semesters to display
  let semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  if (selectedYear === '1st Year') semesters = ['1', '2'];
  else if (selectedYear === '2nd Year') semesters = ['3', '4'];
  else if (selectedYear === '3rd Year') semesters = ['5', '6'];
  else if (selectedYear === '4th Year') semesters = ['7', '8'];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Semester</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {selectedYear && (
          <Text style={styles.subHeader}>
            Showing semesters for <Text style={{ color: COLORS.primary }}>{selectedYear}</Text>
          </Text>
        )}

        {/* SEMESTERS GRID */}
        <View style={styles.gridContainer}>
          {semesters.map((sem) => (
            <TouchableOpacity
              key={sem}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/department',
                  params: { sem, type: resourceType || '' },
                })
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBadge}>
                  <Ionicons name="school-outline" size={20} color={COLORS.primary} />
                </View>
              </View>
              <Text style={styles.cardTitle}>Semester {sem}</Text>
              <View style={styles.exploreRow}>
                <Text style={styles.exploreText}>Explore</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>


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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
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
  cardHeader: {
    marginBottom: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
