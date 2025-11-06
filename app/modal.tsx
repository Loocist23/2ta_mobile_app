import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export default function SupportModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Centre d’assistance</Text>
        <Text style={styles.subtitle}>
          Retrouvez ici les réponses aux questions fréquentes et contactez-nous en cas de besoin.
        </Text>
      </View>

      <View style={styles.card}>
        <IconSymbol name="questionmark.circle.fill" size={28} color={Colors.light.tint} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>FAQ HelloWork</Text>
          <Text style={styles.cardSubtitle}>Consultez notre base de connaissances pour obtenir des réponses rapides.</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/profile/alerts')}
          style={({ pressed }) => [styles.cardButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.cardButtonText}>Ouvrir</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <IconSymbol name="envelope.fill" size={28} color={Colors.light.tint} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Écrire au support</Text>
          <Text style={styles.cardSubtitle}>support@hellowork.com – réponse sous 24h ouvrées.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <IconSymbol name="bubble.left.and.bubble.right.fill" size={28} color={Colors.light.tint} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Prendre rendez-vous</Text>
          <Text style={styles.cardSubtitle}>Planifiez un échange téléphonique avec un conseiller carrière.</Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        accessibilityRole="button">
        <Text style={styles.closeButtonText}>Fermer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    padding: 24,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    color: '#5B6670',
    lineHeight: 21,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  cardSubtitle: {
    fontSize: 14,
    color: '#5B6670',
  },
  cardButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: Colors.light.tint,
  },
  cardButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 'auto',
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
  },
});
