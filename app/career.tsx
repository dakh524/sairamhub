import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

export default function CareerScreen() {
  const router = useRouter();

  const careerSections = [
    { title: 'Placement Materials', icon: '💼', desc: 'Resume Templates, HR Questions, Company Preparation', path: 'Placement' },
    { title: 'Aptitude Materials', icon: '🧠', desc: 'Quantitative, Reasoning, Verbal ability practice questions', path: 'Aptitude' },
    { title: 'GATE Materials', icon: '🎓', desc: 'Formula sheets, syllabus keys, previous year mock tests', path: 'GATE' },
    { title: 'Coding Resources', icon: '💻', desc: 'C++, Java, Python, LeetCode patterns & answers', path: 'Coding' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Career Hub</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subHeader}>
          Explore professional resources and placements guidelines
        </Text>

        {careerSections.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/career-detail',
                params: { category: item.path },
              })
            }
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconBadge}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.desc}
                </Text>
              </View>
            </View>
            <Text style={styles.chevronSymbol}>→</Text>
          </TouchableOpacity>
        ))}
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
  backText: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: 'bold',
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.purpleLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  chevronSymbol: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
});
