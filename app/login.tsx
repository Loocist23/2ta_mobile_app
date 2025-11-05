import { Redirect } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const { user, loading, signInWithGoogle } = useAuth();

  if (user) {
    return <Redirect href="/(tabs)/" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <IconSymbol name="briefcase.fill" size={32} color="#0A66C2" />
        </View>
        <ThemedText type="title" style={styles.title}>
          Retrouvez toutes les opportunités carrière sur HelloWork
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Créez votre compte en quelques secondes pour découvrir les offres qui vous correspondent, suivre vos candidatures et recevoir vos alertes personnalisées.
        </ThemedText>
      </View>

      <ThemedView style={styles.card}>
        <Text style={styles.cardTitle}>Connexion requise</Text>
        <Text style={styles.cardDescription}>
          L’accès à l’application nécessite un compte HelloWork. Connectez-vous avec Google pour sécuriser votre profil et retrouver vos données sur tous vos appareils.
        </Text>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}
          onPress={signInWithGoogle}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <IconSymbol name="g.circle.fill" size={24} color="#fff" />
              <Text style={styles.googleText}>Continuer avec Google</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.helperText}>
          En continuant, vous acceptez nos Conditions Générales d’utilisation et notre politique de confidentialité.
        </Text>
      </ThemedView>

      <View style={styles.bottomContent}>
        <View style={styles.benefit}>
          <View style={styles.benefitIcon}>
            <IconSymbol name="bell.badge.fill" size={24} color={Colors.light.tint} />
          </View>
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Alertes sur-mesure</Text>
            <Text style={styles.benefitSubtitle}>
              Recevez en priorité les offres qui vous correspondent.
            </Text>
          </View>
        </View>
        <View style={styles.benefit}>
          <View style={styles.benefitIcon}>
            <IconSymbol name="tray.full.fill" size={24} color={Colors.light.tint} />
          </View>
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Suivi des candidatures</Text>
            <Text style={styles.benefitSubtitle}>
              Retrouvez vos échanges recruteurs et vos prochaines étapes.
            </Text>
          </View>
        </View>
        <View style={styles.benefit}>
          <View style={styles.benefitIcon}>
            <IconSymbol name="person.crop.circle.badge.checkmark" size={24} color={Colors.light.tint} />
          </View>
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Profil sécurisé</Text>
            <Text style={styles.benefitSubtitle}>
              Gérez vos CV, vos informations et vos préférences en toute simplicité.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E7F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#59636A',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#59636A',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#0A66C2',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  googleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  helperText: {
    fontSize: 13,
    color: '#59636A',
    lineHeight: 18,
  },
  bottomContent: {
    gap: 20,
  },
  benefit: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    padding: 16,
    borderRadius: 16,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextContainer: {
    flex: 1,
    gap: 4,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  benefitSubtitle: {
    fontSize: 14,
    color: '#59636A',
  },
});
