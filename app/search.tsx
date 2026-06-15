import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { fetchAllMaterials } from '../helpers/sheets';
import { Material } from '../types/material';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'subjects' | 'materials' | 'career'>('all');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchAllMaterials();
        setMaterials(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const careerResources = [
    { title: 'Resume Templates', category: 'Placement', desc: 'Create a professional resume using pre-built layouts.' },
    { title: 'Interview Questions', category: 'Placement', desc: 'Frequently asked HR and technical round questions.' },
    { title: 'Quantitative Aptitude', category: 'Aptitude', desc: 'Averages, percentages, time & distance, numbers.' },
    { title: 'LeetCode Patterns', category: 'Coding', desc: 'Top 75 LeetCode question summaries and patterns.' },
    { title: 'GATE Notes', category: 'GATE', desc: 'Comprehensive handwritten study notes for all subjects.' },
  ];

  // Search logic
  const filteredSubjects = query
    ? Array.from(new Set(materials.map((m) => m.subject)))
        .filter((sub) => sub && sub.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
    : [];

  const filteredMaterials = query
    ? materials.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.subject.toLowerCase().includes(query.toLowerCase()) ||
          m.dept.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : [];

  const filteredCareer = query
    ? careerResources.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSubjectPress = (subject: string) => {
    // Navigate to resources for the matching subject. We will find a sample dept & sem from first matching material.
    const match = materials.find((m) => m.subject === subject);
    const dept = match?.dept || 'CSE';
    const sem = match?.sem || '1';
    router.push({
      pathname: '/resources',
      params: { sem, dept, subject },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SEARCH BAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchBarWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects, materials, PYQ..."
            placeholderTextColor={COLORS.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✖</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FILTER TABS */}
      <View style={styles.tabsContainer}>
        {(['all', 'subjects', 'materials', 'career'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.tabItem,
              activeFilter === filter && styles.tabItemActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeFilter === filter && styles.tabLabelActive,
              ]}
            >
              {filter.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {query.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.searchIllustration}>🔍</Text>
              <Text style={styles.emptyTitle}>Type to Search</Text>
              <Text style={styles.emptySubtitle}>
                Search by subject name, file title, department, or career guide.
              </Text>
            </View>
          ) : (
            <View>
              {/* SUBJECTS RESULTS */}
              {(activeFilter === 'all' || activeFilter === 'subjects') &&
                filteredSubjects.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Subjects</Text>
                    {filteredSubjects.map((sub, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.resultRow}
                        onPress={() => handleSubjectPress(sub)}
                      >
                        <Text style={styles.resultIcon}>📖</Text>
                        <Text style={styles.resultText}>{sub}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

              {/* MATERIALS RESULTS */}
              {(activeFilter === 'all' || activeFilter === 'materials') &&
                filteredMaterials.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Materials</Text>
                    {filteredMaterials.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.resultRow}
                        onPress={() =>
                          router.push({
                            pathname: '/detail',
                            params: { data: JSON.stringify(item) },
                          })
                        }
                      >
                        <Text style={styles.resultIcon}>📄</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.resultText}>{item.title}</Text>
                          <Text style={styles.resultSubtext}>
                            {item.dept} • Sem {item.sem} • {item.material_type}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

              {/* CAREER HUB RESULTS */}
              {(activeFilter === 'all' || activeFilter === 'career') &&
                filteredCareer.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Career Resources</Text>
                    {filteredCareer.map((c, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.resultRow}
                        onPress={() =>
                          router.push({
                            pathname: '/career-detail',
                            params: { category: c.category },
                          })
                        }
                      >
                        <Text style={styles.resultIcon}>💼</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.resultText}>{c.title}</Text>
                          <Text style={styles.resultSubtext}>{c.category}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

              {filteredSubjects.length === 0 &&
                filteredMaterials.length === 0 &&
                filteredCareer.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.searchIllustration}>🕵️</Text>
                    <Text style={styles.emptyTitle}>No Results Found</Text>
                    <Text style={styles.emptySubtitle}>
                      Try checking spelling or search for another keyword.
                    </Text>
                  </View>
                )}
            </View>
          )}
        </ScrollView>
      )}
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
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingRight: 12,
  },
  backText: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resultSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  searchIllustration: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
