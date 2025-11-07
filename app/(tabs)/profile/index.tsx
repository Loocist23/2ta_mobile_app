import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { JobCard } from '@/components/job-card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { companies } from '@/constants/companies';
import { Colors } from '@/constants/theme';
import { getJobById, isJobFavorite, useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    toggleFavorite,
    toggleAlertActivation,
    updateSettings,
    signOut,
    deleteAccount,
  } = useAuth();
  const { showToast } = useToast();
  const [pendingAction, setPendingAction] = useState<'signOut' | 'deleteAccount' | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);

  if (!user) {
    return null;
  }

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleSignOut = () => {
    setPendingAction('signOut');
  };

  const handleDeleteAccount = () => {
    setPendingAction('deleteAccount');
  };

  const closeDialog = () => {
    if (dialogBusy) {
      return;
    }

    setPendingAction(null);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) {
      return;
    }

    try {
      setDialogBusy(true);

      if (pendingAction === 'signOut') {
        await signOut();
        showToast({ message: 'Déconnexion effectuée.', type: 'success' });
      } else {
        await deleteAccount();
      }

      router.replace('/login');
    } finally {
      setDialogBusy(false);
      setPendingAction(null);
    }
  };

  const isDeleteAction = pendingAction === 'deleteAccount';
  const dialogTitle = isDeleteAction ? 'Supprimer mon compte' : 'Déconnexion';
  const dialogDescription = isDeleteAction
    ? 'Cette action est définitive. Toutes vos données et vos candidatures seront supprimées.'
    : 'Vous serez déconnecté de votre session actuelle.';
  const dialogConfirmLabel = isDeleteAction ? 'Supprimer' : 'Me déconnecter';

  const favorites = user.favorites
    .map((jobId) => getJobById(jobId))
    .filter((job): job is NonNullable<ReturnType<typeof getJobById>> => Boolean(job));

  const followedCompanies = companies.filter((company) =>
    user.followedCompanies.includes(company.id)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.avatarInitials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>{user.title}</Text>
          <Text style={styles.location}>{user.location}</Text>
          {user.phone && <Text style={styles.location}>{user.phone}</Text>}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/profile/edit-profile')}
          style={({ pressed }) => [styles.primaryBadge, pressed && styles.pressed]}>
          <IconSymbol name="pencil" size={18} color="#fff" />
          <Text style={styles.primaryBadgeText}>Modifier</Text>
        </Pressable>
      </View>

      {user.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes CV & documents</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/profile/documents')}
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            accessibilityRole="button">
            <Text style={styles.linkButtonText}>Gérer</Text>
          </Pressable>
        </View>
        <View style={styles.cvList}>
          {user.cvs.map((cv) => (
            <Pressable
              key={cv.id}
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)/profile/documents')}
              style={({ pressed }) => [styles.cvCard, pressed && styles.pressed]}>
              <View style={styles.cvIcon}>
                <IconSymbol name="doc.text.fill" size={22} color={Colors.light.tint} />
              </View>
              <View style={styles.cvText}>
                <Text style={styles.cvName}>{cv.name}</Text>
                <Text style={styles.cvMeta}>{cv.updatedAt}</Text>
              </View>
              {cv.isPrimary && <Text style={styles.cvBadge}>CV principal</Text>}
            </Pressable>
          ))}
          {user.cvs.length === 0 && (
            <View style={styles.emptyCard}>
              <IconSymbol name="doc.badge.plus" size={24} color={Colors.light.tint} />
              <Text style={styles.emptyCardTitle}>Ajoutez votre premier CV</Text>
              <Text style={styles.emptyCardSubtitle}>
                Importez vos documents pour candidater en un clic.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes alertes</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/profile/alerts')}
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            accessibilityRole="button">
            <Text style={styles.linkButtonText}>Nouvelle alerte</Text>
          </Pressable>
        </View>
        <View style={styles.alertList}>
          {user.alerts.map((alert) => (
            <Pressable
              key={alert.id}
              onPress={() =>
                router.push({
                  pathname: '/search',
                  params: { alertId: alert.id },
                })
              }
              style={({ pressed }) => [styles.alertCard, pressed && styles.pressed]}
              accessibilityRole="button">
              <View style={styles.alertHeader}>
                <View style={styles.alertIcon}>
                  <IconSymbol name="bell.badge.fill" size={20} color={Colors.light.tint} />
                </View>
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMeta}>{alert.location} • {alert.frequency}</Text>
                </View>
                <Switch
                  value={alert.active}
                  onValueChange={() => toggleAlertActivation(alert.id)}
                  trackColor={{ false: '#D7DDE5', true: '#BBD6FF' }}
                  thumbColor={alert.active ? Colors.light.tint : '#fff'}
                />
              </View>
              <Text style={styles.alertKeywords}>{alert.keywords.join(' · ')}</Text>
              <Text style={styles.alertFooter}>Dernière alerte : {alert.lastRun}</Text>
            </Pressable>
          ))}
          {user.alerts.length === 0 && (
            <View style={styles.emptyCard}>
              <IconSymbol name="bell.badge.fill" size={28} color={Colors.light.tint} />
              <Text style={styles.emptyCardTitle}>Créez votre première alerte</Text>
              <Text style={styles.emptyCardSubtitle}>
                Recevez les offres adaptées dès leur publication.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes favoris</Text>
        {favorites.length === 0 ? (
          <View style={styles.emptyCard}>
            <IconSymbol name="bookmark.fill" size={24} color={Colors.light.tint} />
            <Text style={styles.emptyCardTitle}>Ajoutez des offres à vos favoris</Text>
            <Text style={styles.emptyCardSubtitle}>
              Retrouvez-les ici pour candidater rapidement.
            </Text>
          </View>
        ) : (
          <View style={styles.favoriteList}>
            {favorites.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isFavorite={isJobFavorite(job.id, user.favorites)}
                onToggleFavorite={() => toggleFavorite(job.id)}
                onPress={() => router.push({ pathname: '/jobs/[id]', params: { id: job.id } })}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Entreprises suivies</Text>
        {followedCompanies.length === 0 ? (
          <View style={styles.emptyCard}>
            <IconSymbol name="person.2.fill" size={24} color={Colors.light.tint} />
            <Text style={styles.emptyCardTitle}>Suivez vos entreprises préférées</Text>
            <Text style={styles.emptyCardSubtitle}>
              Depuis une fiche entreprise, suivez-la pour être alerté des nouvelles offres.
            </Text>
          </View>
        ) : (
          <View style={styles.companyList}>
            {followedCompanies.map((company) => (
              <Pressable
                key={company.id}
                style={({ pressed }) => [styles.companyCard, pressed && styles.pressed]}
                onPress={() => router.push({ pathname: '/companies/[id]', params: { id: company.id } })}
                accessibilityRole="button">
                <View style={styles.companyLogo}>
                  <Text style={styles.companyLogoText}>{company.name.slice(0, 1)}</Text>
                </View>
                <View style={styles.companyText}>
                  <Text style={styles.companyName}>{company.name}</Text>
                  <Text style={styles.companyMeta}>{company.location}</Text>
                </View>
                <IconSymbol name="chevron.right" size={18} color="#9AA2AA" />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres & assistance</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <IconSymbol name="bell.badge.fill" size={20} color={Colors.light.tint} />
              <Text style={styles.settingTitle}>Notifications push</Text>
            </View>
            <Switch
              value={user.settings.pushNotifications}
              onValueChange={(value) => updateSettings({ pushNotifications: value })}
              trackColor={{ false: '#D7DDE5', true: '#BBD6FF' }}
              thumbColor={user.settings.pushNotifications ? Colors.light.tint : '#fff'}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <IconSymbol name="envelope.fill" size={20} color={Colors.light.tint} />
              <Text style={styles.settingTitle}>Emails hebdomadaires</Text>
            </View>
            <Switch
              value={user.settings.emailSubscriptions}
              onValueChange={(value) => updateSettings({ emailSubscriptions: value })}
              trackColor={{ false: '#D7DDE5', true: '#BBD6FF' }}
              thumbColor={user.settings.emailSubscriptions ? Colors.light.tint : '#fff'}
            />
          </View>
          <Pressable
            onPress={() =>
              updateSettings({
                cookieConsent: user.settings.cookieConsent === 'Complet' ? 'Essentiel' : 'Complet',
              })
            }
            style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
            accessibilityRole="button">
            <View style={styles.settingLabel}>
              <IconSymbol name="list.bullet.rectangle" size={20} color={Colors.light.tint} />
              <Text style={styles.settingTitle}>Gestion des cookies</Text>
            </View>
            <Text style={styles.settingValue}>{user.settings.cookieConsent}</Text>
          </Pressable>
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <IconSymbol name="star.fill" size={20} color={Colors.light.tint} />
              <Text style={styles.settingTitle}>Mode accessibilité</Text>
            </View>
            <Switch
              value={user.settings.accessibilityMode}
              onValueChange={(value) => updateSettings({ accessibilityMode: value })}
              trackColor={{ false: '#D7DDE5', true: '#BBD6FF' }}
              thumbColor={user.settings.accessibilityMode ? Colors.light.tint : '#fff'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Pressable
          onPress={() => router.push('/(tabs)/profile/security')}
          style={({ pressed }) => [styles.fullButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <IconSymbol name={user.hasPassword ? 'lock.fill' : 'key.fill'} size={20} color="#fff" />
          <Text style={styles.fullButtonText}>
            {user.hasPassword ? 'Modifier mon mot de passe' : 'Créer un mot de passe'}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.secondaryFullButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.secondaryFullButtonText}>Me déconnecter</Text>
        </Pressable>
        <Pressable
          onPress={handleDeleteAccount}
          style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.dangerButtonText}>Supprimer mon compte</Text>
        </Pressable>
        <Text style={styles.version}>Version {appVersion}</Text>
      </View>

      <ConfirmationDialog
        visible={pendingAction !== null}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={dialogConfirmLabel}
        destructive={isDeleteAction}
        loading={dialogBusy}
        onCancel={closeDialog}
        onConfirm={handleConfirmAction}
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
    gap: 24,
    paddingBottom: 64,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  role: {
    fontSize: 15,
    color: '#5B6670',
  },
  location: {
    fontSize: 14,
    color: '#77808A',
  },
  bio: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 18,
    fontSize: 15,
    color: '#49525A',
    lineHeight: 22,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  primaryBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  linkButton: {
    backgroundColor: '#EEF2F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  linkButtonText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  cvList: {
    gap: 12,
  },
  cvCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  cvIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvText: {
    flex: 1,
    gap: 4,
  },
  cvName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  cvMeta: {
    fontSize: 13,
    color: '#6B7480',
  },
  cvBadge: {
    backgroundColor: '#E6F2FF',
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  alertList: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  alertMeta: {
    fontSize: 13,
    color: '#6B7480',
  },
  alertKeywords: {
    fontSize: 13,
    color: '#4F5962',
  },
  alertFooter: {
    fontSize: 12,
    color: '#8C97A1',
  },
  favoriteList: {
    gap: 16,
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  emptyCardSubtitle: {
    fontSize: 14,
    color: '#6B7480',
    textAlign: 'center',
    lineHeight: 20,
  },
  companyList: {
    gap: 12,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  companyLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  companyText: {
    flex: 1,
    gap: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  companyMeta: {
    fontSize: 13,
    color: '#6B7480',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    gap: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  settingValue: {
    fontSize: 14,
    color: '#4F5962',
    fontWeight: '600',
  },
  fullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 16,
  },
  fullButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryFullButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryFullButtonText: {
    color: Colors.light.tint,
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FFE6E6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#D13C3C',
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#9299A3',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
  },
});
