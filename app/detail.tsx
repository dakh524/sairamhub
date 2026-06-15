import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { Material } from '../types/material';

export default function DetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawData = params.data as string;
  
  if (!rawData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>No details available.</Text>
      </SafeAreaView>
    );
  }

  const material: Material = JSON.parse(rawData);

  const handleOpenDrive = async () => {
    try {
      const supported = await Linking.canOpenURL(material.drive_link);
      if (supported) {
        await Linking.openURL(material.drive_link);
      } else {
        Alert.alert('Error', 'Unable to open Google Drive Link');
      }
    } catch (err) {
      console.error(err);
      // Fallback open
      Linking.openURL(material.drive_link);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Check out this study material: *${material.title}* (${material.material_type}) for ${material.subject} (${material.dept} - Sem ${material.sem}) on Sairam Hub!\n\nLink: ${material.drive_link}`;
      await Share.share({
        message,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{material.subject}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* LARGE FOLDER ICON */}
        <View style={styles.folderContainer}>
          <View style={styles.folderIconBadge}>
            <Ionicons name="folder-open" size={48} color={COLORS.secondary} />
          </View>
          <Text style={styles.materialTitle}>{material.title}</Text>
          <Text style={styles.materialSubtitle}>
            {material.dept} • Sem {material.sem}
          </Text>
        </View>

        {/* METADATA BOX */}
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Resource Type</Text>
            <Text style={styles.metaValue}>{material.material_type}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Uploaded By</Text>
            <Text style={styles.metaValue}>{material.contributor_name}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Upload Date</Text>
            <Text style={styles.metaValue}>{material.date}</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <TouchableOpacity
          style={styles.openButton}
          onPress={handleOpenDrive}
          activeOpacity={0.9}
        >
          <Ionicons name="cloud-download-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.openButtonText}>Open in Drive</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={18} color={COLORS.text} style={{ marginRight: 8 }} />
          <Text style={styles.shareButtonText}>Share Resource</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  folderIconBadge: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: COLORS.purpleLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.purpleLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  materialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  materialSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  metaBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    width: '100%',
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  metaDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  openButton: {
    backgroundColor: COLORS.secondary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  openButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  shareButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
