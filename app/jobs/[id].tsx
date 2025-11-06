import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { jobOffers } from '@/constants/jobs';
import { companies } from '@/constants/companies';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { showApplicationFeedback } from '@/utils/feedback';

export default function JobDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { user, toggleFavorite } = useAuth();

  const job = useMemo(() => jobOffers.find((item) => item.id === params.id), [params.id]);

  const company = useMemo(() => {
    if (!job) {
      return undefined;
    }

    if (job.companyId) {
      return companies.find((item) => item.id === job.companyId);
    }

    return companies.find((item) => item.name === job.company);
  }, [job]);

  if (!user || !job) {
    return (
      <View style={styles.emptyContainer}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
          <IconSymbol name="chevron.left" size={20} color={Colors.light.tint} />
        </Pressable>
        <Text style={styles.emptyText}>Offre introuvable.</Text>
      </View>
    );
  }

  const isFavorite = user.favorites.includes(job.id);

  const handleApply = () => {
    showApplicationFeedback(job.title);
  };

  const handleOpenCompany = () => {
    if (company) {
      router.push({ pathname: '/companies/[id]', params: { id: company.id } });
    }
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
        <Pressable
          accessibilityRole="button"
          onPress={() => toggleFavorite(job.id)}
          style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}>
          <IconSymbol
            name="bookmark.fill"
            size={22}
            color={isFavorite ? Colors.light.tint : '#C2C8CE'}
          />
        </Pressable>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.subtitle}>
          {job.company} • {job.location}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <IconSymbol name="briefcase.fill" size={18} color={Colors.light.tint} />
          <Text style={styles.metaText}>{job.contract}</Text>
        </View>
        <View style={styles.metaPill}>
          <IconSymbol name="globe.europe.africa.fill" size={18} color={Colors.light.tint} />
          <Text style={styles.metaText}>{job.remoteType}</Text>
        </View>
        <View style={styles.metaPill}>
          <IconSymbol name="clock.fill" size={18} color={Colors.light.tint} />
          <Text style={styles.metaText}>{job.postedAt}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos du poste</Text>
        <Text style={styles.description}>{job.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compétences recherchées</Text>
        <View style={styles.tags}>
          {job.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {company && (
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>L’entreprise</Text>
          <View style={styles.companyCard}>
            <View style={styles.companyHeader}>
              <View style={styles.companyLogo}>
                <Text style={styles.companyInitial}>{company.name.slice(0, 1)}</Text>
              </View>
              <View style={styles.companyHeaderText}>
                <Text style={styles.companyName}>{company.name}</Text>
                <Text style={styles.companySubtitle}>{company.location}</Text>
              </View>
            </View>
            <Text style={styles.companyDescription}>{company.description}</Text>
            <View style={styles.companyMeta}>
              <View style={styles.companyMetaItem}>
                <IconSymbol name="building.2.fill" size={18} color={Colors.light.tint} />
                <Text style={styles.companyMetaText}>{company.industry}</Text>
              </View>
              <View style={styles.companyMetaItem}>
                <IconSymbol name="person.3.fill" size={18} color={Colors.light.tint} />
                <Text style={styles.companyMetaText}>{company.employees} collaborateurs</Text>
              </View>
            </View>
            <View style={styles.companyCulture}>
              {company.culture.map((value) => (
                <View key={value} style={styles.companyChip}>
                  <Text style={styles.companyChipText}>{value}</Text>
                </View>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={handleOpenCompany}
              style={({ pressed }) => [styles.companyButton, pressed && styles.pressed]}>
              <Text style={styles.companyButtonText}>Voir le profil de l’entreprise</Text>
              <IconSymbol name="arrow.right" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.applyCard}>
        <View style={styles.salaryRow}>
          <IconSymbol name="chart.bar.fill" size={20} color={Colors.light.tint} />
          <Text style={styles.salary}>{job.salary}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={handleApply}
          style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}>
          <Text style={styles.applyButtonText}>Postuler à cette offre</Text>
          <IconSymbol name="paperplane.fill" size={20} color="#fff" />
        </Pressable>
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
    paddingBottom: 48,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    color: '#59636A',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#59636A',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444C54',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#ECF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  companyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF3FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  companyHeaderText: {
    flex: 1,
    gap: 4,
  },
  companyName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
  },
  companySubtitle: {
    fontSize: 14,
    color: '#59636A',
  },
  companyDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444C54',
  },
  companyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  companyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyMetaText: {
    fontSize: 13,
    color: '#59636A',
  },
  companyCulture: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  companyChip: {
    backgroundColor: '#F5F7FB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  companyChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  companyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 12,
  },
  companyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  applyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  salary: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
