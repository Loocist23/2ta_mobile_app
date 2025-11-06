import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { JobOffer } from '@/constants/jobs';
import { Colors } from '@/constants/theme';

type JobCardProps = {
  job: JobOffer;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onApply?: () => void;
  onPress?: () => void;
};

export function JobCard({ job, isFavorite, onToggleFavorite, onApply, onPress }: JobCardProps) {
  const handleCardPress = () => {
    if (onPress) {
      onPress();
    }
  };

  const stopPropagation = (callback: () => void) => (event: GestureResponderEvent) => {
    event.stopPropagation();
    callback();
  };

  return (
    <Pressable
      onPress={handleCardPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, onPress && pressed && styles.cardPressed]}
      accessibilityRole={onPress ? 'button' : undefined}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoLetter}>{job.company.slice(0, 1)}</Text>
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.subtitle}>
            {job.company} • {job.location}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          onPress={stopPropagation(onToggleFavorite)}>
          <IconSymbol
            name="bookmark.fill"
            size={22}
            color={isFavorite ? Colors.light.tint : '#C2C8CE'}
          />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <IconSymbol name="briefcase.fill" size={16} color={Colors.light.tint} />
          <Text style={styles.metaText}>{job.contract}</Text>
        </View>
        <View style={styles.metaPill}>
          <IconSymbol name="globe.europe.africa.fill" size={16} color={Colors.light.tint} />
          <Text style={styles.metaText}>{job.remoteType}</Text>
        </View>
        <View style={styles.metaPill}>
          <IconSymbol name="checkmark.seal.fill" size={16} color={Colors.light.tint} />
          <Text style={styles.metaText}>{job.postedAt}</Text>
        </View>
      </View>

      <Text style={styles.description}>{job.description}</Text>

      <View style={styles.tags}>
        {job.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.salaryContainer}>
          <IconSymbol name="chart.bar.fill" size={18} color={Colors.light.tint} />
          <Text style={styles.salaryText}>{job.salary}</Text>
        </View>
        <Pressable
          onPress={onApply ? stopPropagation(onApply) : undefined}
          accessibilityRole="button"
          style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}
          android_ripple={{ color: '#D9E8F5' }}>
          <Text style={styles.applyText}>Postuler</Text>
          <IconSymbol name="arrow.right.circle.fill" size={20} color="#fff" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF3FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  titleSection: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: '#59636A',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  description: {
    fontSize: 14,
    lineHeight: 20,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  applyText: {
    color: '#fff',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
