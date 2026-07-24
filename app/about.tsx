import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About App</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* LOGO AREA */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/app_logo.png')} 
            style={{ width: 250, height: 150, marginBottom: 8 }} 
            resizeMode="contain" 
          />
          <Text style={styles.appName}>Sairam Hub</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        {/* DESCRIPTION CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What is Sairam Hub?</Text>
          <Text style={styles.cardText}>
            Sairam Hub is your ultimate campus companion. Designed to make student life easier, it brings together your class schedules, study materials, exam countdowns, and even some fun mini-games all into one beautiful app!
          </Text>
        </View>

        {/* FEATURES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Key Features</Text>
          
          <View style={styles.featureRow}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} style={styles.featureIcon} />
            <Text style={styles.cardText}>Live Bell Schedule Tracking</Text>
          </View>
          
          <View style={styles.featureRow}>
            <Ionicons name="calculator" size={20} color="#16A34A" style={styles.featureIcon} />
            <Text style={styles.cardText}>Instant CGPA & SGPA Calculator</Text>
          </View>
          
          <View style={styles.featureRow}>
            <Ionicons name="folder-open" size={20} color="#EA580C" style={styles.featureIcon} />
            <Text style={styles.cardText}>Study Material Repository</Text>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="game-controller" size={20} color="#8B5CF6" style={styles.featureIcon} />
            <Text style={styles.cardText}>Interactive Mini-Games</Text>
          </View>
        </View>

        {/* SHARING MATERIALS */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="cloud-upload" size={24} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Sharing Materials</Text>
          </View>
          <Text style={styles.cardText}>
            Students can easily share study materials to help others! To reduce spam and maintain high quality, all uploaded materials must be verified and approved by an admin. Please don't panic if your upload doesn't appear immediately—it will show up on the app as soon as it is approved!
          </Text>
        </View>

        {/* DEVELOPER / CREDITS */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="code-slash" size={24} color="#8B5CF6" style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Credits</Text>
          </View>
          <Text style={styles.cardText}>
            Built with ❤️ for the students by <Text style={{ fontWeight: 'bold', color: COLORS.text }}>DAKH EDU SOLUTIONS</Text>.
            {'\n\n'}
            Have questions, feature requests, or feedback? Contact us at:{'\n'}
            <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>dakhedusolution@gmail.com</Text>
          </Text>
        </View>

        {/* CONTRIBUTE */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="people" size={24} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Contribute</Text>
          </View>
          <Text style={styles.cardText}>
            We are in the first phase as students from college building this to help other students. If you want to contribute and launch more apps like this, you can contact this number through WhatsApp: <Text style={{ fontWeight: 'bold' }}>+91 8667399640</Text>
          </Text>
        </View>

        {/* UPCOMING FEATURES */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="rocket" size={24} color="#F59E0B" style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Upcoming Features</Text>
          </View>
          <Text style={styles.cardText}>
            Future updates will include advanced features like AI chatbot integration, more placement materials, and off-campus company tracking powered by AI. If we reach 5K users, we will roll out these updates!
          </Text>
        </View>

        {/* ADMIN ACCESS BUTTON */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, marginTop: 10, opacity: 0.6 }}
          onPress={() => router.push('/admin')}
        >
          <Ionicons name="lock-closed-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 'bold' }}>Admin Access</Text>
        </TouchableOpacity>

        {/* FOOTER TEXT */}
        <Text style={styles.footerText}>© 2026 Sairam Hub. All rights reserved.</Text>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 30,
  },
  footerText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 20,
  },
});
