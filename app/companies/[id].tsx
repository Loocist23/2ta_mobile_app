import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { JobCard } from '@/components/job-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { jobOffers } from '@/constants/jobs';
import { companies } from '@/constants/companies';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { showApplicationFeedback } from '@/utils/feedback';

export default function CompanyDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { user, toggleFavorite } = useAuth();

  const company = useMemo(() => companies.find((item) => item.id === params.id), [params.id]);

  const relatedJobs = useMemo(() => {
    if (!company) {
      return [];
    }

    return jobOffers.filter(
      (job) => job.companyId === company.id || job.company.toLowerCase() === company.name.toLowerCase()
    );
  }, [company]);

  if (!user || !company) {
    return (
      <View style={styles.emptyContainer}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
          <IconSymbol name="chevron.left" size={20} color={Colors.light.tint} />
        </Pressable>
        <Text style={styles.emptyText}>Entreprise introuvable.</Text>
      </View>
    );
  }

  const handleOpenWebsite = () => {
    Linking.openURL(company.website);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <IconSymbol name="chevron.left" size={20} color={Colors.light.tint} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companyLocation}>{company.location}</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{company.name.slice(0, 1)}</Text>
        </View>
        <Text style={styles.heroDescription}>{company.description}</Text>
        <View style={styles.heroMeta}>
          <View style={styles.metaItem}>
            <IconSymbol name="building.2.fill" size={18} color={Colors.light.tint} />
            <Text style={styles.metaText}>{company.industry}</Text>
          </View>
          <View style={styles.metaItem}>
            <IconSymbol name="person.3.fill" size={18} color={Colors.light.tint} />
            <Text style={styles.metaText}>{company.employees} collaborateurs</Text>
          </View>
          <View style={styles.metaItem}>
            <IconSymbol name="briefcase.fill" size={18} color={Colors.light.tint} />
            <Text style={styles.metaText}>{company.openRoles} offre{company.openRoles > 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View style={styles.cultureRow}>
          {company.culture.map((value) => (
            <View key={value} style={styles.cultureChip}>
              <Text style={styles.cultureChipText}>{value}</Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={handleOpenWebsite}
          style={({ pressed }) => [styles.websiteButton, pressed && styles.pressed]}>
          <Text style={styles.websiteButtonText}>Découvrir le site</Text>
          <IconSymbol name="arrow.up.right" size={18} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offres disponibles</Text>
        <View style={styles.jobsList}>
          {relatedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isFavorite={user.favorites.includes(job.id)}
              onToggleFavorite={() => toggleFavorite(job.id)}
              onApply={() => showApplicationFeedback(job.title)}
              onPress={() => router.push({ pathname: '/jobs/[id]', params: { id: job.id } })}
            />
          ))}
          {relatedJobs.length === 0 && (
            <View style={styles.emptyJobs}>
              <IconSymbol name="tray" size={28} color={Colors.light.tint} />
              <Text style={styles.emptyJobsTitle}>Pas d’offre actuellement</Text>
              <Text style={styles.emptyJobsSubtitle}>
                Revenez bientôt, de nouvelles opportunités arrivent régulièrement.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    gap: 4,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  companyLocation: {
    fontSize: 14,
    color: '#59636A',
  },
  hero: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF3FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444C54',
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#59636A',
  },
  cultureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cultureChip: {
    backgroundColor: '#F5F7FB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cultureChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  websiteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  jobsList: {
    gap: 16,
  },
  emptyJobs: {
    alignItems: 'center',
    gap: 10,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  emptyJobsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  emptyJobsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#59636A',
  },
  pressed: {
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
});
