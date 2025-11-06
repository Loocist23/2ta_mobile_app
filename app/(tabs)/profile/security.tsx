import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function SecurityScreen() {
  const router = useRouter();
  const { user, activeProvider, updatePassword, deleteAccount } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [confirmDeletion, setConfirmDeletion] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [router, user]);

  const requiresCurrentPassword = Boolean(user?.hasPassword);

  const providerDescription = useMemo(() => {
    if (!activeProvider) {
      return "Définissez un mot de passe pour sécuriser l'accès à votre compte.";
    }

    if (activeProvider === 'google') {
      return 'Vous êtes connecté via Google. Créez un mot de passe 2TA pour accéder à votre compte même sans Google.';
    }

    if (activeProvider === 'apple') {
      return 'Vous utilisez Apple pour vous connecter. Vous pouvez ajouter un mot de passe 2TA pour vous connecter sur le web ou Android.';
    }

    return 'Changez régulièrement votre mot de passe pour sécuriser vos données.';
  }, [activeProvider]);

  if (!user) {
    return null;
  }

  const handleUpdatePassword = async () => {
    setFormError(null);
    setFormSuccess(null);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setFormError('Renseignez et confirmez votre nouveau mot de passe.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    if (requiresCurrentPassword && currentPassword.trim().length === 0) {
      setFormError('Indiquez votre mot de passe actuel pour continuer.');
      return;
    }

    try {
      setUpdating(true);
      await updatePassword({
        currentPassword: requiresCurrentPassword ? currentPassword : undefined,
        newPassword: newPassword.trim(),
      });
      setFormSuccess('Votre mot de passe a été mis à jour.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Impossible de mettre à jour le mot de passe pour le moment.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);

    Alert.alert(
      'Confirmation',
      'Cette action est définitive. Vos candidatures, alertes et documents seront supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteAccount();
            } catch (error) {
              if (error instanceof Error) {
                setDeleteError(error.message);
              } else {
                setDeleteError('La suppression du compte a échoué.');
              }
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="lock.fill" size={24} color={Colors.light.tint} />
          <View style={styles.sectionText}>
            <Text style={styles.title}>Gestion du mot de passe</Text>
            <Text style={styles.description}>{providerDescription}</Text>
          </View>
        </View>

        {requiresCurrentPassword && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe actuel</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#9AA2AA"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nouveau mot de passe</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Au moins 8 caractères"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#9AA2AA"
          />
          <Text style={styles.helper}>Incluez au moins une lettre et un chiffre.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmez le mot de passe"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#9AA2AA"
          />
        </View>

        {formError && <Text style={styles.error}>{formError}</Text>}
        {formSuccess && <Text style={styles.success}>{formSuccess}</Text>}

        <Pressable
          accessibilityRole="button"
          onPress={handleUpdatePassword}
          disabled={updating}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
            updating && styles.disabledButton,
          ]}>
          <Text style={styles.primaryButtonText}>
            {requiresCurrentPassword ? 'Modifier mon mot de passe' : 'Créer un mot de passe 2TA'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="trash.fill" size={24} color="#D13C3C" />
          <View style={styles.sectionText}>
            <Text style={styles.title}>Supprimer mon compte</Text>
            <Text style={styles.description}>
              Tapez « SUPPRIMER » pour activer le bouton et confirmer la suppression définitive.
            </Text>
          </View>
        </View>

        <TextInput
          value={confirmDeletion}
          onChangeText={setConfirmDeletion}
          placeholder="SUPPRIMER"
          autoCapitalize="characters"
          style={styles.input}
          placeholderTextColor="#9AA2AA"
        />

        {deleteError && <Text style={styles.error}>{deleteError}</Text>}

        <Pressable
          accessibilityRole="button"
          onPress={handleDeleteAccount}
          disabled={confirmDeletion !== 'SUPPRIMER' || deleting}
          style={({ pressed }) => [
            styles.dangerButton,
            pressed && styles.pressed,
            (confirmDeletion !== 'SUPPRIMER' || deleting) && styles.disabledButton,
          ]}>
          <Text style={styles.dangerButtonText}>Supprimer mon compte</Text>
        </Pressable>
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
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  description: {
    fontSize: 14,
    color: '#59636A',
    lineHeight: 20,
  },
  inputGroup: {
    gap: 6,
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
  helper: {
    fontSize: 12,
    color: '#7B8590',
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#C0353A',
    fontSize: 14,
  },
  success: {
    color: '#1B6AE5',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  disabledButton: {
    opacity: 0.6,
  },
  dangerButton: {
    backgroundColor: '#F8D7DA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E49AA2',
  },
  dangerButtonText: {
    color: '#C0353A',
    fontWeight: '600',
    fontSize: 16,
  },
});
