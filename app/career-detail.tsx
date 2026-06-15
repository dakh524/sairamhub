import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

interface CareerResource {
  title: string;
  desc: string;
  link: string;
  icon: string;
}

export default function CareerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = (params.category as string) || 'Placement';

  const defaultDriveLink = 'https://sairam.edu.in/wp-content/uploads/2024/07/Copy-of-24ECPC301-SIGNALS-AND-SYSTEMS.pdf';

  // Resource lists based on category with real external links
  const dataMap: Record<string, CareerResource[]> = {
    Placement: [
      { title: 'Resume Templates', desc: 'Create a professional resume using pre-built layouts.', link: 'https://novoresume.com/', icon: '📄' },
      { title: 'Interview Questions', desc: 'Frequently asked HR and technical round questions.', link: 'https://www.geeksforgeeks.org/explore?page=1&category[]=Interview%20Preparation', icon: '💬' },
      { title: 'Company Preparation', desc: 'Preparation materials for TCS, Infosys, Zoho, Wipro.', link: 'https://www.geeksforgeeks.org/company-interview-corner/', icon: '🏢' },
      { title: 'Technical Resources', desc: 'Quick refreshers for DSA, OOPS, DBMS, and OS.', link: 'https://www.tutorialspoint.com/', icon: '💻' },
      { title: 'Aptitude for Placement', desc: 'Targeted assessment test papers and questions.', link: 'https://www.indiabix.com/', icon: '🔢' },
      { title: 'Soft Skills', desc: 'Communication, presentation, and body language tips.', link: 'https://www.coursera.org/courses?query=soft%20skills', icon: '🤝' },
    ],
    Aptitude: [
      { title: 'Quantitative Aptitude', desc: 'Averages, percentages, time & distance, numbers.', link: 'https://www.indiabix.com/aptitude/questions-and-answers/', icon: '📈' },
      { title: 'Reasoning Ability', desc: 'Syllogisms, blood relations, seating arrangements.', link: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/', icon: '🧩' },
      { title: 'Verbal Ability', desc: 'Grammar, sentence completion, reading comprehension.', link: 'https://www.indiabix.com/verbal-ability/questions-and-answers/', icon: '✏️' },
      { title: 'Practice Test Sets', desc: 'Mock assessment papers with detailed answer keys.', link: 'https://prepinsta.com/', icon: '📝' },
    ],
    Coding: [
      { title: 'C Programming', desc: 'Pointers, structures, file operations, arrays.', link: 'https://www.learn-c.org/', icon: '⚙️' },
      { title: 'C++ & OOPs', desc: 'Classes, polymorphism, inheritance, templates.', link: 'https://cplusplus.com/doc/tutorial/', icon: '🛡️' },
      { title: 'Java Core', desc: 'Multithreading, collections, exception handling.', link: 'https://www.javatpoint.com/java-tutorial', icon: '☕' },
      { title: 'Python Programming', desc: 'Lists, dictionaries, libraries like NumPy/Pandas.', link: 'https://www.learnpython.org/', icon: '🐍' },
      { title: 'Data Structures', desc: 'Linked lists, trees, graphs, heaps, stacks.', link: 'https://www.geeksforgeeks.org/data-structures/', icon: '📊' },
      { title: 'Algorithms Guide', desc: 'Sorting, searching, dynamic programming, greedy methods.', link: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/', icon: '🧠' },
      { title: 'Web Development', desc: 'HTML, CSS, JavaScript, React basics.', link: 'https://www.freecodecamp.org/', icon: '🌐' },
      { title: 'LeetCode Patterns', desc: 'Top 75 LeetCode question summaries and patterns.', link: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions', icon: '⭐' },
    ],
    Internships: [
      { title: 'Resume Building Guide', desc: 'How to structure resumes for startup & corporate internships.', link: 'https://rxresu.me/', icon: '📝' },
      { title: 'LinkedIn Profile Guide', desc: 'Optimize your profile, network, and find off-campus gigs.', link: 'https://www.linkedin.com/help/linkedin/answer/a554351', icon: '🔗' },
      { title: 'Project Ideas', desc: 'Web, mobile, AI/ML, and embedded project frameworks.', link: 'https://github.com/florinpop17/app-ideas', icon: '💡' },
      { title: 'Career Roadmaps', desc: 'Step-by-step guides for frontend, backend, data science.', link: 'https://roadmap.sh/', icon: '🗺️' },
    ],
    GATE: [
      { title: 'GATE Notes', desc: 'Comprehensive handwritten study notes for all subjects.', link: 'https://www.madeeasy.in/', icon: '📓' },
      { title: 'Formula Sheets', desc: 'Quick reference cheat sheets for mathematical formulas.', link: 'https://byjus.com/gate/', icon: '📐' },
      { title: 'Question Banks', desc: 'Topic-wise collection of previous year GATE questions.', link: 'https://gateoverflow.in/', icon: '📦' },
      { title: 'Mock Test Series', desc: 'Self-assessment test series designed by GATE experts.', link: 'https://testbook.com/gate-preparation', icon: '✏️' },
    ],
  };

  const currentList = dataMap[category] || dataMap.Placement;

  const handleOpen = async (link: string) => {
    try {
      await Linking.openURL(link);
    } catch (err) {
      Alert.alert('Error', 'Unable to open link');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Materials</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {currentList.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => handleOpen(item.link)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconBadge}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
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
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
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
