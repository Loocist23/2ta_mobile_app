import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { JobCard } from '@/components/job-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  highlightedTopics,
  jobOffers,
  partnerCompanies,
} from '@/constants/jobs';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { user, toggleFavorite } = useAuth();

  if (!user) {
    return null;
  }

  const handleApply = (jobTitle: string) => {
    Alert.alert(
      'Candidature envoyée',
      `Votre candidature pour "${jobTitle}" a bien été prise en compte. Retrouvez son suivi dans l'onglet Candidatures.`,
      [{ text: 'Fermer' }]
    );
  };

  const activeAlerts = user.alerts.filter((alert) => alert.active);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.avatarInitials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.welcome}>Bonjour {user.name.split(' ')[0]} 👋</Text>
          <Text style={styles.location}>{user.title} • {user.location}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Vos notifications', 'Retrouvez le détail dans l’onglet Notifs.')}>
          <View style={styles.notificationBubble}>
            <IconSymbol name="bell.badge.fill" size={22} color={Colors.light.tint} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {user.notifications.filter((notification) => !notification.read).length}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <IconSymbol name="chart.bar.fill" size={22} color={Colors.light.tint} />
          <Text style={styles.statValue}>{user.stats.profileViews}</Text>
          <Text style={styles.statLabel}>vues profil</Text>
        </View>
        <View style={styles.statCard}>
          <IconSymbol name="envelope.fill" size={22} color={Colors.light.tint} />
          <Text style={styles.statValue}>{user.stats.recruiterMessages}</Text>
          <Text style={styles.statLabel}>messages recruteurs</Text>
        </View>
        <View style={styles.statCard}>
          <IconSymbol name="tray.full.fill" size={22} color={Colors.light.tint} />
          <Text style={styles.statValue}>{user.stats.applicationsInProgress}</Text>
          <Text style={styles.statLabel}>candidatures</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes alertes actives</Text>
          <Pressable onPress={() => Alert.alert('Créer une alerte', 'Rendez-vous sur votre profil pour créer de nouvelles alertes.')}>
            <Text style={styles.sectionAction}>Créer une alerte</Text>
          </Pressable>
        </View>
        <View style={styles.alertGrid}>
          {activeAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <IconSymbol name="bell.badge.fill" size={20} color={Colors.light.tint} />
                <Text style={styles.alertTitle}>{alert.title}</Text>
              </View>
              <Text style={styles.alertMeta}>{alert.location} • {alert.frequency}</Text>
              <Text style={styles.alertKeywords}>{alert.keywords.join(' · ')}</Text>
              <Text style={styles.alertFooter}>Dernière alerte : {alert.lastRun}</Text>
            </View>
          ))}
          {activeAlerts.length === 0 && (
            <View style={styles.emptyAlert}>
              <IconSymbol name="bell.badge.fill" size={28} color={Colors.light.tint} />
              <Text style={styles.emptyAlertTitle}>Activez votre première alerte</Text>
              <Text style={styles.emptyAlertSubtitle}>
                Recevez les offres adaptées dès leur publication.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offres recommandées</Text>
        <View style={styles.cardsColumn}>
          {jobOffers.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isFavorite={user.favorites.includes(job.id)}
              onToggleFavorite={() => toggleFavorite(job.id)}
              onApply={() => handleApply(job.title)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Les tendances du moment</Text>
        <View style={styles.topicGrid}>
          {highlightedTopics.map((topic) => (
            <View key={topic.id} style={styles.topicCard}>
              <IconSymbol name="star.fill" size={24} color={Colors.light.tint} />
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDescription}>{topic.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Entreprises partenaires</Text>
          <Pressable onPress={() => Alert.alert('Entreprises partenaires', 'Découvrez toutes nos entreprises partenaires depuis le site HelloWork.')}> 
            <Text style={styles.sectionAction}>Voir tout</Text>
          </Pressable>
        </View>
        <View style={styles.partnerRow}>
          {partnerCompanies.map((partner) => (
            <View key={partner.id} style={styles.partnerCard}>
              <Text style={styles.partnerName}>{partner.name}</Text>
              <Text style={styles.partnerRoles}>{partner.roles} postes ouverts</Text>
            </View>
          ))}
        </View>
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
    gap: 24,
    paddingBottom: 64,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  location: {
    fontSize: 14,
    color: '#59636A',
  },
  notificationBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF715B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'flex-start',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 13,
    color: '#59636A',
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
  sectionAction: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  alertGrid: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  alertMeta: {
    fontSize: 13,
    color: '#59636A',
  },
  alertKeywords: {
    fontSize: 13,
    color: '#2F6DE0',
    fontWeight: '500',
  },
  alertFooter: {
    fontSize: 12,
    color: '#889097',
  },
  emptyAlert: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    gap: 12,
  },
  emptyAlertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  emptyAlertSubtitle: {
    fontSize: 14,
    color: '#59636A',
    textAlign: 'center',
  },
  cardsColumn: {
    gap: 16,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    flexBasis: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  topicDescription: {
    fontSize: 13,
    color: '#59636A',
    lineHeight: 18,
  },
  partnerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  partnerCard: {
    flexBasis: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 6,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  partnerRoles: {
    fontSize: 13,
    color: '#59636A',
  },
});
