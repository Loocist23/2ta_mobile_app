import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { JobCard } from '@/components/job-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { jobOffers } from '@/constants/jobs';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { showApplicationFeedback } from '@/utils/feedback';
import { useToast } from '@/context/ToastContext';

const CONTRACTS: ('CDI' | 'CDD' | 'Freelance' | 'Stage')[] = ['CDI', 'CDD', 'Freelance', 'Stage'];
const REMOTE_OPTIONS = ['Tous', 'Télétravail', 'Hybride', 'Présentiel'] as const;
const SALARY_OPTIONS = ['Tous', '≥ 50 k€', '≥ 60 k€', '≥ 70 k€'] as const;
const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'salary_desc', label: 'Salaire décroissant' },
  { value: 'company', label: 'A → Z entreprise' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];
function extractMinSalary(salary: string) {
  const match = salary.match(/(\d+[\s\u00A0]?[\d]*)/);
  if (!match) {
    return 0;
  }
  const normalized = match[1].replace(/\s|\u00A0/g, '');
  return Number(normalized);
}

const CONTRACTS: ('CDI' | 'CDD' | 'Freelance' | 'Stage')[] = ['CDI', 'CDD', 'Freelance', 'Stage'];
const REMOTE_OPTIONS = ['Tous', 'Télétravail', 'Hybride', 'Présentiel'] as const;
const SALARY_OPTIONS = ['Tous', '≥ 50 k€', '≥ 60 k€', '≥ 70 k€'] as const;
const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'salary_desc', label: 'Salaire décroissant' },
  { value: 'company', label: 'A → Z entreprise' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];
function extractMinSalary(salary: string) {
  const match = salary.match(/(\d+[\s\u00A0]?[\d]*)/);
  if (!match) {
    return 0;
  }
  const normalized = match[1].replace(/\s|\u00A0/g, '');
  return Number(normalized);
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    alertId?: string;
    keywords?: string;
    location?: string;
  }>();
  const { user, toggleFavorite, createAlert, updateAlert } = useAuth();
  const { showToast } = useToast();

  const alert = useMemo(() => {
    if (!user || !params.alertId) {
      return undefined;
    }

    return user.alerts.find((item) => item.id === params.alertId);
  }, [params.alertId, user]);

  const defaultKeywords = useMemo(() => {
    if (alert) {
      return alert.keywords;
    }

    if (params.keywords && typeof params.keywords === 'string') {
      return params.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean);
    }

    return [];
  }, [alert, params.keywords]);

  const defaultLocation = useMemo(() => {
    if (alert) {
      return alert.location;
    }

    if (params.location && typeof params.location === 'string') {
      return params.location;
    }

    return '';
  }, [alert, params.location]);

  const [keywords, setKeywords] = useState(defaultKeywords.join(', '));
  const [location, setLocation] = useState(defaultLocation);
  const [query, setQuery] = useState(alert?.title ?? '');
  const [contractFilters, setContractFilters] = useState<Set<string>>(new Set());
  const [remoteFilter, setRemoteFilter] = useState<(typeof REMOTE_OPTIONS)[number]>(
    alert ? 'Tous' : 'Tous'
  );
  const [salaryFilter, setSalaryFilter] = useState<(typeof SALARY_OPTIONS)[number]>('Tous');
  const [sort, setSort] = useState<SortOption>('recent');

  const keywordList = useMemo(
    () =>
      keywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    [keywords]
  );

  const filteredJobs = useMemo(() => {
    const normalizedLocation = location.trim().toLowerCase();
    const normalizedQuery = query.trim().toLowerCase();
    const contracts = Array.from(contractFilters);
    const minSalary = salaryFilter === 'Tous' ? 0 : Number(salaryFilter.replace(/[^0-9]/g, '')) * 1000;

    const jobs = jobOffers
      .filter((job) => {
        const locationMatch =
          !normalizedLocation || job.location.toLowerCase().includes(normalizedLocation);
        const queryMatch =
          !normalizedQuery ||
          job.title.toLowerCase().includes(normalizedQuery) ||
          job.description.toLowerCase().includes(normalizedQuery);
        const keywordMatch =
          keywordList.length === 0 ||
          keywordList.every((keyword) => {
            const normalizedKeyword = keyword.toLowerCase();
            return (
              job.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword)) ||
              job.description.toLowerCase().includes(normalizedKeyword) ||
              job.title.toLowerCase().includes(normalizedKeyword)
            );
          });
        const contractMatch =
          contracts.length === 0 || contracts.includes(job.contract);
        const remoteMatch =
          remoteFilter === 'Tous' || job.remoteType === remoteFilter;
        const salaryMatch = extractMinSalary(job.salary) >= minSalary;

        return locationMatch && queryMatch && keywordMatch && contractMatch && remoteMatch && salaryMatch;
      })
      .sort((a, b) => {
        if (sort === 'salary_desc') {
          return extractMinSalary(b.salary) - extractMinSalary(a.salary);
        }
        if (sort === 'company') {
          return a.company.localeCompare(b.company, 'fr');
        }
        return 0;
      });

    return jobs;
  }, [contractFilters, keywordList, location, query, remoteFilter, salaryFilter, sort]);

  if (!user) {
    return null;
  }

  const toggleContract = (contract: string) => {
    setContractFilters((prev) => {
      const next = new Set(prev);
      if (next.has(contract)) {
        next.delete(contract);
      } else {
        next.add(contract);
      }
      return next;
    });
  };

  const handleSaveSearch = () => {
    const title = query.trim() || keywordList.join(', ') || 'Nouvelle alerte';
    const keywordsForAlert = keywordList.length > 0 ? keywordList : title.split(' ');

    if (alert) {
      updateAlert(alert.id, {
        title,
        keywords: keywordsForAlert,
        location: location.trim() || 'Télétravail',
      });
      showToast({
        message: 'Alerte mise à jour avec vos filtres.',
        type: 'success',
      });
      return;
    }

    const id = createAlert({
      title,
      keywords: keywordsForAlert,
      location: location.trim() || 'Télétravail',
      frequency: 'Quotidienne',
      active: true,
    });

    showToast({
      message: 'Alerte créée. Nous vous préviendrons dès qu’une offre correspond.',
      type: 'success',
    });
    router.replace({ pathname: '/search', params: { alertId: id } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <IconSymbol name="chevron.left" size={20} color={Colors.light.tint} />
        </Pressable>
        <Text style={styles.title}>Recherche d’offres</Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Poste recherché</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Titre du poste, mots-clés..."
            placeholderTextColor="#98A1A8"
            style={styles.input}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mots-clés</Text>
          <TextInput
            value={keywords}
            onChangeText={setKeywords}
            placeholder="UX, Produit, ..."
            placeholderTextColor="#98A1A8"
            style={styles.input}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Localisation</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Ville, région..."
            placeholderTextColor="#98A1A8"
            style={styles.input}
          />
        </View>

        {keywordList.length > 0 && (
          <View style={styles.keywordList}>
            {keywordList.map((keyword) => (
              <View key={keyword} style={styles.keywordChip}>
                <Text style={styles.keywordChipText}>{keyword}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Type de contrat</Text>
          <View style={styles.chipRow}>
            {CONTRACTS.map((contract) => {
              const isActive = contractFilters.has(contract);
              return (
                <Pressable
                  key={contract}
                  onPress={() => toggleContract(contract)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button">
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {contract}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Mode de travail</Text>
          <View style={styles.chipRow}>
            {REMOTE_OPTIONS.map((option) => {
              const isActive = remoteFilter === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setRemoteFilter(option)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button">
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Rémunération</Text>
          <View style={styles.chipRow}>
            {SALARY_OPTIONS.map((option) => {
              const isActive = salaryFilter === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setSalaryFilter(option)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button">
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Trier par</Text>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((option) => {
              const isActive = sort === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSort(option.value)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button">
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>
          {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} trouvée{filteredJobs.length > 1 ? 's' : ''}
        </Text>
        <Pressable
          onPress={handleSaveSearch}
          style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <IconSymbol name={alert ? 'bookmark.fill' : 'bookmark'} size={18} color={Colors.light.tint} />
          <Text style={styles.saveButtonText}>
            {alert ? 'Mettre à jour mon alerte' : 'Sauvegarder en alerte'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            isFavorite={user.favorites.includes(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onApply={() => showApplicationFeedback(item.title)}
            onPress={() => router.push({ pathname: '/jobs/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="magnifyingglass" size={42} color={Colors.light.tint} />
            <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
            <Text style={styles.emptySubtitle}>
              Ajustez vos filtres ou élargissez la zone géographique pour découvrir plus d’opportunités.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  filters: {
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#202833',
  },
  keywordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordChip: {
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  keywordChipText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  filterSection: {
    gap: 10,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F5962',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#EEF2F8',
  },
  filterChipActive: {
    backgroundColor: Colors.light.tint,
  },
  filterChipText: {
    color: '#4F5962',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E5FF',
  },
  saveButtonText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  list: {
    gap: 16,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7480',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  pressed: {
    opacity: 0.85,
  },
});
