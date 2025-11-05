import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { getJobById, useAuth } from '@/context/AuthContext';

function getStatusColors(status: string) {
  switch (status) {
    case 'Entretien planifié':
      return { background: '#E8F5FF', text: '#1B6AE5' };
    case "En cours d'étude":
      return { background: '#FFF5E5', text: '#E58B1B' };
    case 'Proposition reçue':
      return { background: '#E6F7EA', text: '#2F9D6B' };
    default:
      return { background: '#F0F2F7', text: '#4B5563' };
  }
}

export default function ApplicationsScreen() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mes candidatures</Text>
      <Text style={styles.subtitle}>
        Suivez vos candidatures et préparez vos prochaines étapes en un coup d’œil.
      </Text>

      <View style={styles.timelineCard}>
        <IconSymbol name="calendar.badge.clock" size={26} color={Colors.light.tint} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>3 prochaines étapes à venir</Text>
          <Text style={styles.timelineSubtitle}>
            Pensez à préparer vos entretiens et à relancer les recruteurs après 7 jours sans réponse.
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {user.applications.map((application) => {
          const job = getJobById(application.jobId);
          const { background, text } = getStatusColors(application.status);

          return (
            <View key={application.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.logo}>
                  <Text style={styles.logoText}>{application.company.slice(0, 1)}</Text>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.cardTitle}>{application.title}</Text>
                  <Text style={styles.cardSubtitle}>{application.company}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: background }]}>
                  <Text style={[styles.statusText, { color: text }]}>{application.status}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <IconSymbol name="doc.text.fill" size={18} color={Colors.light.tint} />
                <Text style={styles.detailsText}>{application.lastUpdate}</Text>
              </View>
              {application.nextStep && (
                <View style={styles.detailsRow}>
                  <IconSymbol name="checkmark.seal.fill" size={18} color={Colors.light.tint} />
                  <Text style={styles.detailsText}>{application.nextStep}</Text>
                </View>
              )}
              {job && (
                <View style={styles.detailsRow}>
                  <IconSymbol name="briefcase.fill" size={18} color={Colors.light.tint} />
                  <Text style={styles.detailsText}>
                    {job.location} • {job.contract} • {job.remoteType}
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                  onPress={() => Alert.alert('Relancer le recruteur', 'Nous venons d’envoyer un rappel courtois à l’entreprise.')}
                  accessibilityRole="button">
                  <Text style={styles.secondaryButtonText}>Relancer</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                  onPress={() => Alert.alert('Voir le détail', 'Retrouvez l’historique complet de la candidature sur le site HelloWork.')}
                  accessibilityRole="button">
                  <Text style={styles.primaryButtonText}>Voir l’offre</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
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
    gap: 16,
    paddingBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    color: '#5B6670',
    lineHeight: 20,
  },
  timelineCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
    gap: 6,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: '#5B6670',
    lineHeight: 20,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E7EFFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#5B6670',
  },
  statusChip: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#4A545E',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#EEF1F6',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
