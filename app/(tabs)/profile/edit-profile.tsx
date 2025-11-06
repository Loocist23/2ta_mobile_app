import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [title, setTitle] = useState(user?.title ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');

  const isDirty = useMemo(() => {
    if (!user) {
      return false;
    }

    return (
      name.trim() !== user.name ||
      title.trim() !== user.title ||
      location.trim() !== user.location ||
      phone.trim() !== (user.phone ?? '') ||
      bio.trim() !== (user.bio ?? '')
    );
  }, [bio, location, name, phone, title, user]);

  const handleSave = () => {
    if (!user) {
      return;
    }

    if (!name.trim()) {
      Alert.alert('Nom requis', 'Veuillez renseigner votre nom complet.');
      return;
    }

    updateProfile({
      name: name.trim(),
      title: title.trim(),
      location: location.trim(),
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined,
    });

    Alert.alert('Profil mis à jour', 'Vos informations ont bien été enregistrées.', [
      {
        text: 'Fermer',
        onPress: () => router.back(),
      },
    ]);
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.group}>
        <Text style={styles.label}>Nom complet</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex : Camille Martin"
          placeholderTextColor="#A0A7AF"
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Intitulé de poste</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ex : Product Designer"
          placeholderTextColor="#A0A7AF"
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Localisation</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Ville, région..."
          placeholderTextColor="#A0A7AF"
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Ex : +33 6 12 34 56 78"
          placeholderTextColor="#A0A7AF"
          style={styles.input}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Présentation</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Présentez-vous en quelques phrases"
          placeholderTextColor="#A0A7AF"
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={6}
        />
        <Text style={styles.helper}>Astuce : mettez en avant vos domaines d’expertise et réussites clés.</Text>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={!isDirty}
        style={({ pressed }) => [styles.saveButton, (!isDirty || pressed) && styles.saveButtonDisabled]}
        accessibilityRole="button">
        <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
        <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
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
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#202833',
  },
  textarea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: 13,
    color: '#6B7480',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
