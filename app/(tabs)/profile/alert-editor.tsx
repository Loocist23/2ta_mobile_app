import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const FREQUENCIES: ('Quotidienne' | 'Hebdomadaire')[] = ['Quotidienne', 'Hebdomadaire'];

export default function AlertEditorScreen() {
  const router = useRouter();
  const { alertId } = useLocalSearchParams<{ alertId?: string }>();
  const { user, createAlert, updateAlert } = useAuth();
  const { showToast } = useToast();

  const existingAlert = useMemo(() => {
    if (!user || !alertId || typeof alertId !== 'string') {
      return undefined;
    }

    return user.alerts.find((item) => item.id === alertId);
  }, [alertId, user]);

  const [title, setTitle] = useState(existingAlert?.title ?? '');
  const [keywords, setKeywords] = useState(existingAlert ? existingAlert.keywords.join(', ') : '');
  const [location, setLocation] = useState(existingAlert?.location ?? '');
  const [frequency, setFrequency] = useState<'Quotidienne' | 'Hebdomadaire'>(
    existingAlert?.frequency ?? 'Quotidienne'
  );
  const [active, setActive] = useState(existingAlert?.active ?? true);

  const keywordList = useMemo(
    () =>
      keywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    [keywords]
  );

  const handleSave = () => {
    if (!title.trim()) {
      showToast({
        message: 'Nommez votre alerte pour la retrouver facilement.',
        type: 'error',
      });
      return;
    }

    if (keywordList.length === 0) {
      showToast({
        message: 'Ajoutez au moins un mot-clé séparé par une virgule.',
        type: 'error',
      });
      return;
    }

    if (!location.trim()) {
      showToast({
        message: 'Indiquez une ville, une région ou Télétravail.',
        type: 'error',
      });
      return;
    }

    if (existingAlert) {
      updateAlert(existingAlert.id, {
        title: title.trim(),
        keywords: keywordList,
        location: location.trim(),
        frequency,
        active,
        lastRun: existingAlert.lastRun,
      });
      showToast({ message: 'Alerte mise à jour.', type: 'success' });
      router.back();
      return;
    }

    const id = createAlert({
      title: title.trim(),
      keywords: keywordList,
      location: location.trim(),
      frequency,
      active,
    });

    showToast({
      message: 'Alerte créée. Nous vous préviendrons dès que de nouvelles offres correspondent.',
      type: 'success',
    });
    router.replace({ pathname: '/search', params: { alertId: id } });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.group}>
        <Text style={styles.label}>Titre de l’alerte</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ex : Product designer Paris"
          placeholderTextColor="#9AA2AA"
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Mots-clés (séparés par des virgules)</Text>
        <TextInput
          value={keywords}
          onChangeText={setKeywords}
          placeholder="UX, Figma, Télétravail, …"
          placeholderTextColor="#9AA2AA"
          style={styles.input}
        />
        {keywordList.length > 0 && (
          <View style={styles.keywords}>
            {keywordList.map((keyword) => (
              <View key={keyword} style={styles.keywordChip}>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Localisation</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Ville, région ou Télétravail"
          placeholderTextColor="#9AA2AA"
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Fréquence d’envoi</Text>
        <View style={styles.frequencyRow}>
          {FREQUENCIES.map((value) => {
            const isSelected = frequency === value;
            return (
              <Pressable
                key={value}
                onPress={() => setFrequency(value)}
                style={({ pressed }) => [
                  styles.frequencyChip,
                  isSelected && styles.frequencyChipActive,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button">
                <Text style={[styles.frequencyText, isSelected && styles.frequencyTextActive]}>
                  {value}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.groupRow}>
        <View style={styles.groupRowText}>
          <Text style={styles.label}>Alerte active</Text>
          <Text style={styles.helper}>Désactivez-la pour suspendre temporairement les notifications.</Text>
        </View>
        <Switch
          value={active}
          onValueChange={setActive}
          trackColor={{ false: '#D7DDE5', true: '#BBD6FF' }}
          thumbColor={active ? Colors.light.tint : '#fff'}
        />
      </View>

      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
        accessibilityRole="button">
        <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
        <Text style={styles.saveButtonText}>
          {existingAlert ? 'Enregistrer les modifications' : 'Créer mon alerte'}
        </Text>
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
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
  },
  groupRowText: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  helper: {
    fontSize: 13,
    color: '#6B7480',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#202833',
  },
  keywords: {
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
  keywordText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyChip: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#EEF2F8',
    paddingVertical: 12,
    alignItems: 'center',
  },
  frequencyChipActive: {
    backgroundColor: Colors.light.tint,
  },
  frequencyText: {
    color: '#5B6670',
    fontWeight: '600',
  },
  frequencyTextActive: {
    color: '#fff',
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
  pressed: {
    opacity: 0.85,
  },
});
