import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { getJobById, useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

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

function formatNow(label: string) {
  const date = new Date();
  return `${label} le ${date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
  })}`;
}

export default function ApplicationsScreen() {
  const router = useRouter();
  const { user, addApplicationNote, updateApplicationStatus } = useAuth();
  const { showToast } = useToast();

  if (!user) {
    return null;
  }

  const handleFollowUp = (applicationId: string) => {
    const note = formatNow('Relance envoyée');
    addApplicationNote(applicationId, note);
    showToast({
      message: 'Relance enregistrée pour cette candidature.',
      type: 'success',
    });
  };

  const handleStatusAdvance = (applicationId: string, currentStatus: string) => {
    if (currentStatus === 'Proposition reçue') {
      showToast({
        message: 'Cette candidature est déjà au dernier stade.',
        type: 'info',
      });
      return;
    }

    const nextStatus =
      currentStatus === 'Candidature envoyée'
        ? "En cours d'étude"
        : currentStatus === "En cours d'étude"
        ? 'Entretien planifié'
        : 'Proposition reçue';

    updateApplicationStatus(applicationId, nextStatus, formatNow('Prochaine étape'));
    showToast({
      message: `Statut mis à jour : ${nextStatus}.`,
      type: 'success',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mes candidatures</Text>
          <Text style={styles.subtitle}>
            Suivez vos candidatures et préparez vos prochaines étapes en un coup d’œil.
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/applications/new')}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </Pressable>
      </View>

      <View style={styles.timelineCard}>
        <IconSymbol name="calendar.badge.clock" size={26} color={Colors.light.tint} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>{user.applications.length} candidatures suivies</Text>
          <Text style={styles.timelineSubtitle}>
            Ajoutez des notes après vos entretiens pour garder l’historique complet dans l’app.
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
                <View style={styles.headerInfo}>
                  <Text style={styles.cardTitle}>{application.title}</Text>
                  <Text style={styles.cardSubtitle}>{application.company}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: background }]}>
                  <Text style={[styles.statusText, { color: text }]}>{application.status}</Text>
                </View>
              </View>

              <View style={styles.details}>
                <View style={styles.detailsRow}>
                  <IconSymbol name="doc.text.fill" size={18} color={Colors.light.tint} />
                  <Text style={styles.detailsText}>{application.appliedOn}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <IconSymbol name="clock.fill" size={18} color={Colors.light.tint} />
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
              </View>

              {application.notes.length > 0 && (
                <View style={styles.notes}>
                  <Text style={styles.notesTitle}>Notes personnelles</Text>
                  {application.notes.map((note, index) => (
                    <View key={`${application.id}-note-${index}`} style={styles.noteItem}>
                      <IconSymbol name="scribble" size={16} color={Colors.light.tint} />
                      <Text style={styles.noteText}>{note}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                  onPress={() => handleFollowUp(application.id)}
                  accessibilityRole="button">
                  <Text style={styles.secondaryButtonText}>Relancer</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && application.status !== 'Proposition reçue' && styles.pressed,
                    application.status === 'Proposition reçue' && styles.secondaryButtonDisabled,
                  ]}
                  onPress={() => handleStatusAdvance(application.id, application.status)}
                  accessibilityRole="button"
                  disabled={application.status === 'Proposition reçue'}>
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      application.status === 'Proposition reçue' && styles.secondaryButtonTextDisabled,
                    ]}>
                    Avancer le statut
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                  onPress={() =>
                    router.push({ pathname: '/(tabs)/applications/[id]', params: { id: application.id } })
                  }
                  accessibilityRole="button">
                  <Text style={styles.primaryButtonText}>Ajouter une note</Text>
                </Pressable>
                {job && (
                  <Pressable
                    style={({ pressed }) => [styles.primaryOutline, pressed && styles.pressed]}
                    onPress={() => router.push({ pathname: '/jobs/[id]', params: { id: job.id } })}
                    accessibilityRole="button">
                    <Text style={styles.primaryOutlineText}>Voir l’offre</Text>
                  </Pressable>
                )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 6,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    gap: 16,
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
  headerInfo: {
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
  details: {
    gap: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#4B5563',
  },
  notes: {
    gap: 10,
    backgroundColor: '#F5F7FB',
    borderRadius: 16,
    padding: 14,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#4F5962',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: '#EEF2F8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryButtonDisabled: {
    backgroundColor: '#E1E5EC',
  },
  secondaryButtonText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  secondaryButtonTextDisabled: {
    color: '#9AA2AA',
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  primaryOutline: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryOutlineText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
