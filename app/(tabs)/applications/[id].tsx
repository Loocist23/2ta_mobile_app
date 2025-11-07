import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const STATUSES: ('Candidature envoyée' | "En cours d'étude" | 'Entretien planifié' | 'Proposition reçue')[] = [
  'Candidature envoyée',
  "En cours d'étude",
  'Entretien planifié',
  'Proposition reçue',
];

export default function ApplicationDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, updateApplicationStatus, updateApplication, addApplicationNote } = useAuth();
  const { showToast } = useToast();

  const application = useMemo(() => {
    if (!user || !id || typeof id !== 'string') {
      return undefined;
    }

    return user.applications.find((item) => item.id === id);
  }, [id, user]);

  const [status, setStatus] = useState(application?.status ?? 'Candidature envoyée');
  const [nextStep, setNextStep] = useState(application?.nextStep ?? '');
  const [note, setNote] = useState('');

  if (!application) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Candidature introuvable</Text>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}>
          <Text style={styles.emptyButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const handleSave = () => {
    updateApplicationStatus(application.id, status, nextStep.trim() || undefined);
    updateApplication(application.id, {
      nextStep: nextStep.trim() || undefined,
    });

    if (note.trim()) {
      addApplicationNote(application.id, note.trim());
      setNote('');
    }

    showToast({
      message: 'Candidature mise à jour.',
      type: 'success',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summary}>
        <IconSymbol name="briefcase.fill" size={20} color={Colors.light.tint} />
        <View style={styles.summaryText}>
          <Text style={styles.summaryTitle}>{application.title}</Text>
          <Text style={styles.summarySubtitle}>{application.company}</Text>
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Statut actuel</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((value) => {
            const isActive = status === value;
            return (
              <Pressable
                key={value}
                onPress={() => setStatus(value)}
                style={({ pressed }) => [
                  styles.statusChip,
                  isActive && styles.statusChipActive,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button">
                <Text style={[styles.statusText, isActive && styles.statusTextActive]}>{value}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Prochaine étape</Text>
        <TextInput
          value={nextStep}
          onChangeText={setNextStep}
          placeholder="Décrivez la prochaine action à mener"
          placeholderTextColor="#9AA2AA"
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Ajouter une note au journal</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ajoutez vos retours d’entretien, ressentis, etc."
          placeholderTextColor="#9AA2AA"
          style={[styles.input, styles.textarea]}
          multiline
        />
        <Text style={styles.helper}>Cette note sera ajoutée à l’historique en bas de la candidature.</Text>
      </View>

      {application.notes.length > 0 && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Historique des notes</Text>
          {application.notes.map((item, index) => (
            <View key={`${application.id}-note-${index}`} style={styles.noteItem}>
              <IconSymbol name="scribble" size={16} color={Colors.light.tint} />
              <Text style={styles.noteText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
        accessibilityRole="button">
        <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </Pressable>
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
    gap: 20,
    paddingBottom: 40,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
  },
  summaryText: {
    flex: 1,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#5B6670',
  },
  group: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statusRow: {
    flexDirection: 'column',
    gap: 10,
  },
  statusChip: {
    borderRadius: 14,
    backgroundColor: '#EEF2F8',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statusChipActive: {
    backgroundColor: Colors.light.tint,
  },
  statusText: {
    color: '#4F5962',
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#202833',
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: 13,
    color: '#6B7480',
  },
  notes: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  notesTitle: {
    fontSize: 15,
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 18,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
    backgroundColor: '#F5F6F8',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
