import { Redirect } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const {
    user,
    loading,
    hydrated,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    requestPasswordReset,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(
    () => loading || email.trim().length === 0 || password.trim().length === 0,
    [email, loading, password]
  );

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  if (!hydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Chargement de vos préférences…</Text>
      </View>
    );
  }

  const handleEmailSignIn = async () => {
    setError(null);
    try {
      await signInWithEmail({ email, password, fullName });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur inattendue est survenue.');
      }
    }
  };

  const toggleResetMode = () => {
    if (mode === 'reset') {
      setMode('login');
      setResetEmail('');
      setResetError(null);
      setResetSuccess(null);
    } else {
      setMode('reset');
      setResetEmail(email.trim());
      setResetError(null);
      setResetSuccess(null);
    }
  };

  const handleRequestReset = async () => {
    setResetError(null);
    setResetSuccess(null);
    const normalized = resetEmail.trim();

    if (!normalized) {
      setResetError('Veuillez renseigner votre adresse email.');
      return;
    }
    try {
      setResetSubmitting(true);
      await requestPasswordReset(normalized);
      setResetSuccess('Nous venons de vous envoyer un email pour réinitialiser votre mot de passe.');
    } catch (err) {
      if (err instanceof Error) {
        setResetError(err.message);
      } else {
        setResetError('Impossible d’envoyer le lien pour le moment.');
      }
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <IconSymbol name="briefcase.fill" size={32} color="#0A66C2" />
          </View>
          <ThemedText type="title" style={styles.title}>
            Retrouvez toutes les opportunités d&#39;alternance sur Trouve Ton Alternance(2TA)
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Créez votre compte en quelques secondes pour découvrir les offres qui vous correspondent, suivre vos candidatures et recevoir vos alertes personnalisées.
          </ThemedText>
        </View>

        <ThemedView style={styles.card}>
          <Text style={styles.cardTitle}>Connexion requise</Text>
          <Text style={styles.cardDescription}>
            Choisissez votre méthode de connexion pour sécuriser votre profil et retrouver vos données sur tous vos appareils.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.providerButton, pressed && styles.buttonPressed]}
            onPress={signInWithGoogle}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <IconSymbol name="a.login" size={24} color="#fff" />
                <Text style={styles.providerText}>Continuer avec Google</Text>
              </>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.providerButton, pressed && styles.buttonPressed, styles.appleButton]}
            onPress={signInWithApple}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.light.tint} />
            ) : (
              <>
                <IconSymbol name="applelogo" size={24} color="#000" />
                <Text style={styles.appleText}>Continuer avec Apple</Text>
              </>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou utilisez votre email</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Adresse email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="prenom.nom@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              placeholderTextColor="#9AA2AA"
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#9AA2AA"
            />
            <Text style={styles.helperText}>6 caractères minimum. Vous pourrez le modifier plus tard.</Text>
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Nom complet (facultatif)</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Camille Martin"
              autoCapitalize="words"
              style={styles.input}
              placeholderTextColor="#9AA2AA"
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
              isSubmitDisabled && styles.buttonDisabled,
            ]}
            onPress={handleEmailSignIn}
            disabled={isSubmitDisabled}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Se connecter / Créer un compte</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={toggleResetMode}
            style={({ pressed }) => [styles.linkButton, pressed && styles.buttonPressed]}>
            <Text style={styles.linkButtonText}>
              {mode === 'reset' ? 'Revenir à la connexion' : 'Mot de passe oublié ?'}
            </Text>
          </Pressable>

          {mode === 'reset' && (
            <View style={styles.resetCard}>
              <Text style={styles.resetTitle}>Réinitialiser mon mot de passe</Text>
              <Text style={styles.resetDescription}>
                Indiquez votre adresse email pour recevoir un lien sécurisé de réinitialisation.
              </Text>
              <TextInput
                value={resetEmail}
                onChangeText={setResetEmail}
                placeholder="prenom.nom@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.resetInput}
                placeholderTextColor="#9AA2AA"
              />
              {resetError && <Text style={styles.errorText}>{resetError}</Text>}
              {resetSuccess && <Text style={styles.successText}>{resetSuccess}</Text>}
              <Pressable
                accessibilityRole="button"
                onPress={handleRequestReset}
                disabled={resetSubmitting || resetEmail.trim().length === 0}
                style={({ pressed }) => [
                  styles.resetButton,
                  pressed && styles.buttonPressed,
                  (resetSubmitting || resetEmail.trim().length === 0) && styles.buttonDisabled,
                ]}>
                {resetSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.resetButtonText}>Envoyer le lien de réinitialisation</Text>
                )}
              </Pressable>
            </View>
          )}

          <Text style={styles.termsText}>
            En continuant, vous acceptez nos Conditions Générales d’utilisation et notre politique de confidentialité.
          </Text>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
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
    gap: 20,
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
  providerButton: {
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
  providerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  appleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D7DDE5',
  },
  appleText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#000',
  },
  helperText: {
    fontSize: 13,
    color: '#59636A',
    lineHeight: 18,
  },
  termsText: {
    fontSize: 13,
    color: '#59636A',
    lineHeight: 18,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E8EC',
  },
  dividerText: {
    fontSize: 13,
    color: '#59636A',
  },
  formField: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7DDE5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: '#F8F9FB',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  resetCard: {
    marginTop: 12,
    backgroundColor: '#F0F4FF',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  resetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  resetDescription: {
    fontSize: 14,
    color: '#4E5A64',
    lineHeight: 20,
  },
  resetInput: {
    borderWidth: 1,
    borderColor: '#C7D6F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  resetButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#C0353A',
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#1B6AE5',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#59636A',
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
