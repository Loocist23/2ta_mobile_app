import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { companies } from '@/constants/companies';
import { jobOffers } from '@/constants/jobs';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

function formatAppliedLabel(jobTitle: string) {
  const date = new Date();
  return `Candidature envoyée pour “${jobTitle}” le ${date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
  })}`;
}

export default function JobDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const {
    user,
    toggleFavorite,
    addApplication,
    followCompany,
    unfollowCompany,
  } = useAuth();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [includeProfile, setIncludeProfile] = useState(true);

  const job = useMemo(() => jobOffers.find((item) => item.id === params.id), [params.id]);

  const company = useMemo(() => {
    if (!job) {
      return undefined;
    }

    if (job.companyId) {
      return companies.find((item) => item.id === job.companyId);
    }

    return companies.find((item) => item.name === job.company);
  }, [job]);

  if (!user || !job) {
    return (
      <View style={styles.emptyContainer}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
          <IconSymbol name="chevron.left" size={20} color={Colors.light.tint} />
        </Pressable>
        <Text style={styles.emptyText}>Offre introuvable.</Text>
      </View>
    );
  }

  const isFavorite = user.favorites.includes(job.id);
  const isFollowingCompany = company ? user.followedCompanies.includes(company.id) : false;

  const handleOpenCompany = () => {
    if (company) {
      router.push({ pathname: '/companies/[id]', params: { id: company.id } });
    }
  };

  const handleApply = () => {
    if (!selectedCvId && user.cvs.length > 0) {
      setSelectedCvId(user.cvs[0].id);
    }
    setShowModal(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${job.title} chez ${job.company} – ${job.location}`,
        url: 'https://www.hellowork.com',
        title: job.title,
      });
    } catch {
      showToast({ message: 'Partage impossible, réessayez plus tard.', type: 'error' });
    }
  };

  const handleToggleFollow = () => {
    if (!company) {
      return;
    }

    if (isFollowingCompany) {
      unfollowCompany(company.id);
    } else {
      followCompany(company.id);
    }
  };

  const handleSubmitApplication = () => {
    if (!selectedCvId) {
      showToast({ message: 'Sélectionnez le document à joindre à votre candidature.', type: 'error' });
      return;
    }

    const notes: string[] = [
      includeProfile
        ? 'Profil partagé automatiquement avec la candidature mobile'
        : 'Candidature envoyée sans partage automatique',
    ];

    if (message.trim()) {
      notes.push(`Message au recruteur : ${message.trim()}`);
    }

    addApplication({
      jobId: job.id,
      company: job.company,
      title: job.title,
      status: 'Candidature envoyée',
      appliedOn: formatAppliedLabel(job.title),
      lastUpdate: 'Candidature envoyée depuis l’application mobile',
      nextStep: includeProfile ? 'Suivre la réponse recruteur' : undefined,
      notes,
    });

    showToast({ message: 'Votre candidature a été ajoutée à votre suivi.', type: 'success' });
    setShowModal(false);
    setMessage('');
    setIncludeProfile(true);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <IconSymbol name="chevron.left" size={20} color={Colors.light.tint} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => toggleFavorite(job.id)}
            style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}>
            <IconSymbol
              name="bookmark.fill"
              size={22}
              color={isFavorite ? Colors.light.tint : '#C2C8CE'}
            />
          </Pressable>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.subtitle}>
            {job.company} • {job.location}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <IconSymbol name="briefcase.fill" size={18} color={Colors.light.tint} />
            <Text style={styles.metaText}>{job.contract}</Text>
          </View>
          <View style={styles.metaPill}>
            <IconSymbol name="globe.europe.africa.fill" size={18} color={Colors.light.tint} />
            <Text style={styles.metaText}>{job.remoteType}</Text>
          </View>
          <View style={styles.metaPill}>
            <IconSymbol name="clock.fill" size={18} color={Colors.light.tint} />
            <Text style={styles.metaText}>{job.postedAt}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos du poste</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compétences recherchées</Text>
          <View style={styles.tags}>
            {job.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {company && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>L’entreprise</Text>
            <View style={styles.companyCard}>
              <View style={styles.companyHeader}>
                <View style={styles.companyLogo}>
                  <Text style={styles.companyInitial}>{company.name.slice(0, 1)}</Text>
                </View>
                <View style={styles.companyHeaderText}>
                  <Text style={styles.companyName}>{company.name}</Text>
                  <Text style={styles.companySubtitle}>{company.location}</Text>
                </View>
              </View>
              <Text style={styles.companyDescription}>{company.description}</Text>
              <View style={styles.companyMeta}>
                <View style={styles.companyMetaItem}>
                  <IconSymbol name="building.2.fill" size={18} color={Colors.light.tint} />
                  <Text style={styles.companyMetaText}>{company.industry}</Text>
                </View>
                <View style={styles.companyMetaItem}>
                  <IconSymbol name="person.3.fill" size={18} color={Colors.light.tint} />
                  <Text style={styles.companyMetaText}>{company.employees} collaborateurs</Text>
                </View>
              </View>
              <View style={styles.companyCulture}>
                {company.culture.map((value) => (
                  <View key={value} style={styles.companyChip}>
                    <Text style={styles.companyChipText}>{value}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.companyActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleToggleFollow}
                  style={({ pressed }) => [
                    styles.followButton,
                    isFollowingCompany && styles.followButtonActive,
                    pressed && styles.pressed,
                  ]}>
                  <IconSymbol
                    name={isFollowingCompany ? 'heart.fill' : 'heart'}
                    size={18}
                    color={isFollowingCompany ? '#fff' : Colors.light.tint}
                  />
                  <Text
                    style={[
                      styles.followButtonText,
                      isFollowingCompany && styles.followButtonTextActive,
                    ]}>
                    {isFollowingCompany ? 'Entreprise suivie' : 'Suivre cette entreprise'}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleOpenCompany}
                  style={({ pressed }) => [styles.companyButton, pressed && styles.pressed]}>
                  <Text style={styles.companyButtonText}>Voir le profil</Text>
                  <IconSymbol name="arrow.right" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <View style={styles.applyCard}>
          <View style={styles.salaryRow}>
            <IconSymbol name="chart.bar.fill" size={20} color={Colors.light.tint} />
            <Text style={styles.salary}>{job.salary}</Text>
          </View>
          <View style={styles.applyActions}>
            <Pressable
              accessibilityRole="button"
              onPress={handleApply}
              style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}>
              <Text style={styles.applyButtonText}>Postuler depuis l’app</Text>
              <IconSymbol name="paperplane.fill" size={20} color="#fff" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleShare}
              style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
              <IconSymbol name="square.and.arrow.up" size={18} color={Colors.light.tint} />
              <Text style={styles.secondaryActionText}>Partager</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Envoyer ma candidature</Text>
            <Text style={styles.modalSubtitle}>
              Sélectionnez le document à joindre et ajoutez un message pour le recruteur.
            </Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Choisir un CV</Text>
              {user.cvs.map((cv) => {
                const isActive = selectedCvId === cv.id;
                return (
                  <Pressable
                    key={cv.id}
                    onPress={() => setSelectedCvId(cv.id)}
                    style={({ pressed }) => [
                      styles.cvOption,
                      isActive && styles.cvOptionActive,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button">
                    <IconSymbol
                      name={isActive ? 'checkmark.circle.fill' : 'doc.text'}
                      size={20}
                      color={isActive ? Colors.light.tint : '#77808A'}
                    />
                    <View style={styles.cvOptionText}>
                      <Text style={styles.cvOptionTitle}>{cv.name}</Text>
                      <Text style={styles.cvOptionSubtitle}>{cv.updatedAt}</Text>
                    </View>
                  </Pressable>
                );
              })}
              {user.cvs.length === 0 && (
                <Text style={styles.emptyCv}>Ajoutez un CV depuis votre profil pour candidater.</Text>
              )}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Message au recruteur</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                placeholder="Expliquez votre motivation en quelques phrases"
                placeholderTextColor="#9AA2AA"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalSwitchRow}>
              <View style={styles.modalSwitchText}>
                <Text style={styles.modalLabel}>Partager mon profil complet</Text>
                <Text style={styles.modalHelper}>
                  Inclut votre expérience et vos coordonnées avec la candidature.
                </Text>
              </View>
              <Switch
                value={includeProfile}
                onValueChange={setIncludeProfile}
                trackColor={{ false: '#D7DDE5', true: '#BBD6FF' }}
                thumbColor={includeProfile ? Colors.light.tint : '#fff'}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowModal(false)}
                style={({ pressed }) => [styles.modalSecondary, pressed && styles.pressed]}
                accessibilityRole="button">
                <Text style={styles.modalSecondaryText}>Annuler</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmitApplication}
                disabled={!selectedCvId}
                style={({ pressed }) => [
                  styles.modalPrimary,
                  !selectedCvId && styles.modalPrimaryDisabled,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button">
                <IconSymbol name="paperplane.fill" size={18} color="#fff" />
                <Text style={styles.modalPrimaryText}>Envoyer ma candidature</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    color: '#5B6670',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F7FB',
    borderRadius: 999,
  },
  metaText: {
    fontSize: 13,
    color: '#59636A',
    fontWeight: '500',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444C54',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#ECF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 13,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  companyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF3FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  companyHeaderText: {
    flex: 1,
    gap: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  companySubtitle: {
    fontSize: 14,
    color: '#5B6670',
  },
  companyDescription: {
    fontSize: 14,
    color: '#444C54',
    lineHeight: 20,
  },
  companyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  companyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyMetaText: {
    fontSize: 13,
    color: '#59636A',
  },
  companyCulture: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  companyChip: {
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  companyChipText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  companyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2F8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  followButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  followButtonText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  followButtonTextActive: {
    color: '#fff',
  },
  companyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  companyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  applyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  applyActions: {
    gap: 12,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 16,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF2F8',
    paddingVertical: 12,
    borderRadius: 14,
  },
  secondaryActionText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#5B6670',
    lineHeight: 20,
  },
  modalSection: {
    gap: 12,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalInput: {
    backgroundColor: '#F5F7FB',
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: '#202833',
    textAlignVertical: 'top',
  },
  modalSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalSwitchText: {
    flex: 1,
    gap: 4,
  },
  modalHelper: {
    fontSize: 13,
    color: '#6B7480',
  },
  cvOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F7FB',
    padding: 14,
    borderRadius: 14,
  },
  cvOptionActive: {
    borderWidth: 2,
    borderColor: Colors.light.tint,
    backgroundColor: '#EAF2FF',
  },
  cvOptionText: {
    flex: 1,
    gap: 2,
  },
  cvOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  cvOptionSubtitle: {
    fontSize: 13,
    color: '#6B7480',
  },
  emptyCv: {
    fontSize: 13,
    color: '#6B7480',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalSecondary: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#EEF2F8',
  },
  modalSecondaryText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  modalPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  modalPrimaryDisabled: {
    opacity: 0.6,
  },
  modalPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#F5F6F8',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  pressed: {
    opacity: 0.85,
  },
});
