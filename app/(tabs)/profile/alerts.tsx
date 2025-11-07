import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AlertsScreen() {
  const router = useRouter();
  const { user, toggleAlertActivation, deleteAlert } = useAuth();
  const { showToast } = useToast();
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);

  const pendingAlert = useMemo(() => {
    if (!alertToDelete || !user) {
      return null;
    }

    return user.alerts.find((item) => item.id === alertToDelete) ?? null;
  }, [alertToDelete, user]);

  if (!user) {
    return null;
  }

  const handleDeleteRequest = (alertId: string) => {
    setAlertToDelete(alertId);
  };

  const closeDialog = () => setAlertToDelete(null);

  const confirmDelete = () => {
    if (!alertToDelete) {
      return;
    }

    deleteAlert(alertToDelete);
    showToast({ message: 'Alerte supprimée.', type: 'success' });
    setAlertToDelete(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Créez des alertes personnalisées pour être averti des offres qui correspondent à vos critères.
      </Text>

      <Pressable
        onPress={() => router.push('/(tabs)/profile/alert-editor')}
        style={({ pressed }) => [styles.createCard, pressed && styles.pressed]}
        accessibilityRole="button">
        <IconSymbol name="plus.circle.fill" size={26} color="#fff" />
        <View style={styles.createText}>
          <Text style={styles.createTitle}>Nouvelle alerte</Text>
          <Text style={styles.createSubtitle}>Définissez un intitulé, des mots-clés et une zone géographique.</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#fff" />
      </Pressable>

      <View style={styles.list}>
        {user.alerts.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <IconSymbol name="bell.badge.fill" size={22} color={Colors.light.tint} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>{item.location} • {item.frequency}</Text>
              </View>
              <Switch
                value={item.active}
                onValueChange={() => toggleAlertActivation(item.id)}
                trackColor={{ false: '#D7DDE5', true: '#BBD6FF' }}
                thumbColor={item.active ? Colors.light.tint : '#fff'}
              />
            </View>
            <Text style={styles.cardKeywords}>{item.keywords.join(' · ')}</Text>
            <Text style={styles.cardFooter}>Dernier envoi : {item.lastRun}</Text>
            <View style={styles.actions}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/(tabs)/profile/alert-editor', params: { alertId: item.id } })
                }
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                accessibilityRole="button">
                <IconSymbol name="slider.horizontal.3" size={16} color={Colors.light.tint} />
                <Text style={styles.secondaryButtonText}>Modifier</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/search', params: { alertId: item.id } })
                }
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                accessibilityRole="button">
                <IconSymbol name="magnifyingglass" size={16} color={Colors.light.tint} />
                <Text style={styles.secondaryButtonText}>Voir les offres</Text>
              </Pressable>
              <Pressable
                onPress={() => handleDeleteRequest(item.id)}
                style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}
                accessibilityRole="button">
                <IconSymbol name="trash" size={16} color="#D13C3C" />
                <Text style={styles.dangerButtonText}>Supprimer</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {user.alerts.length === 0 && (
          <View style={styles.empty}>
            <IconSymbol name="bell.badge" size={32} color={Colors.light.tint} />
            <Text style={styles.emptyTitle}>Aucune alerte pour l’instant</Text>
            <Text style={styles.emptySubtitle}>
              Utilisez le bouton ci-dessus pour créer votre première alerte personnalisée.
            </Text>
          </View>
        )}
      </View>
      <ConfirmationDialog
        visible={alertToDelete !== null}
        title="Supprimer l’alerte"
        description={
          pendingAlert
            ? `Voulez-vous retirer l’alerte « ${pendingAlert.title} » ?`
            : 'Voulez-vous retirer cette alerte emploi ?'
        }
        confirmLabel="Supprimer"
        destructive
        onCancel={closeDialog}
        onConfirm={confirmDelete}
      />
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
  intro: {
    fontSize: 15,
    color: '#4F5962',
    lineHeight: 22,
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.light.tint,
    padding: 18,
    borderRadius: 18,
  },
  createText: {
    flex: 1,
    gap: 4,
  },
  createTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  createSubtitle: {
    fontSize: 14,
    color: '#E7F0FF',
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  cardMeta: {
    fontSize: 13,
    color: '#6B7480',
  },
  cardKeywords: {
    fontSize: 13,
    color: '#4F5962',
  },
  cardFooter: {
    fontSize: 12,
    color: '#8C97A1',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2F8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE6E6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dangerButtonText: {
    color: '#D13C3C',
    fontWeight: '600',
  },
  empty: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7480',
    textAlign: 'center',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.85,
  },
});
