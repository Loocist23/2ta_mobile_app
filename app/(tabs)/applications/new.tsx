import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { jobOffers } from '@/constants/jobs';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const STATUSES: ('Candidature envoyée' | "En cours d'étude" | 'Entretien planifié' | 'Proposition reçue')[] = [
  'Candidature envoyée',
  "En cours d'étude",
  'Entretien planifié',
  'Proposition reçue',
];

function formatAppliedOn() {
  const date = new Date();
  return `Candidature envoyée le ${date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
  })}`;
}

export default function NewApplicationScreen() {
  const router = useRouter();
  const { addApplication, user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'Candidature envoyée' | "En cours d'étude" | 'Entretien planifié' | 'Proposition reçue'>(
    'Candidature envoyée'
  );
  const [nextStep, setNextStep] = useState('');
  const [notes, setNotes] = useState('');

  const suggestedJobs = useMemo(() => jobOffers.slice(0, 5), []);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedCompany = company.trim();

    if (!trimmedTitle || !trimmedCompany) {
      Alert.alert('Informations manquantes', 'Indiquez un poste et une entreprise.');
      return;
    }

    addApplication({
      jobId: selectedJobId ?? trimmedTitle,
      company: trimmedCompany,
      title: trimmedTitle,
      status,
      appliedOn: formatAppliedOn(),
      lastUpdate: 'Ajoutée à l’instant',
      nextStep: nextStep.trim() || undefined,
      notes: notes.trim() ? [notes.trim()] : [],
    });

    Alert.alert('Candidature ajoutée', 'Votre suivi a été mis à jour.', [
      { text: 'Fermer', onPress: () => router.back() },
    ]);
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.group}>
        <Text style={styles.label}>Poste</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Titre du poste"
          placeholderTextColor="#9AA2AA"
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Entreprise</Text>
        <TextInput
          value={company}
          onChangeText={setCompany}
          placeholder="Nom de l’entreprise"
          placeholderTextColor="#9AA2AA"
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Sélectionner une offre suggérée</Text>
        <View style={styles.chips}>
          {suggestedJobs.map((job) => {
            const isActive = selectedJobId === job.id;
            return (
              <Pressable
                key={job.id}
                onPress={() => {
                  setSelectedJobId(job.id);
                  setTitle(job.title);
                  setCompany(job.company);
                }}
                style={({ pressed }) => [
                  styles.chip,
                  isActive && styles.chipActive,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button">
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {job.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Statut</Text>
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
          placeholder="Ex : Relancer dans une semaine, préparer le cas pratique…"
          placeholderTextColor="#9AA2AA"
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Ajouter une note</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Vos impressions, les points à relancer…"
          placeholderTextColor="#9AA2AA"
          style={[styles.input, styles.textarea]}
          multiline
        />
      </View>

      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
        accessibilityRole="button">
        <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
        <Text style={styles.submitButtonText}>Enregistrer la candidature</Text>
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
  group: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 14,
    backgroundColor: '#EEF2F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: Colors.light.tint,
  },
  chipText: {
    color: '#4F5962',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 18,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
