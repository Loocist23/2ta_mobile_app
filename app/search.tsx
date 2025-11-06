import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { JobCard } from '@/components/job-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { jobOffers } from '@/constants/jobs';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { showApplicationFeedback } from '@/utils/feedback';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    alertId?: string;
    keywords?: string;
    location?: string;
  }>();
  const { user, toggleFavorite } = useAuth();

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

    return jobOffers.filter((job) => {
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

      return locationMatch && queryMatch && keywordMatch;
    });
  }, [keywordList, location, query]);

  if (!user) {
    return null;
  }

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
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>
          {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} trouvée{filteredJobs.length > 1 ? 's' : ''}
        </Text>
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
              Ajustez vos mots-clés ou votre localisation pour découvrir plus d’opportunités.
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
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#59636A',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
  },
  keywordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordChip: {
    backgroundColor: '#ECF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  keywordChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  list: {
    gap: 16,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#59636A',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  pressed: {
    opacity: 0.7,
  },
});
