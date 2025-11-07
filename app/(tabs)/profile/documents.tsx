import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function DocumentsScreen() {
  const { user, addCv, renameCv, removeCv, setPrimaryCv } = useAuth();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  if (!user) {
    return null;
  }

  const handleAdd = () => {
    const value = newName.trim();
    if (!value) {
      Alert.alert('Nom requis', 'Veuillez nommer votre document.');
      return;
    }

    addCv(value);
    setNewName('');
  };

  const handleRename = (id: string) => {
    const value = editingValue.trim();
    if (!value) {
      Alert.alert('Nom requis', 'Le nom du document ne peut pas être vide.');
      return;
    }

    renameCv(id, value);
    setEditingId(null);
    setEditingValue('');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer le document', 'Voulez-vous vraiment retirer ce CV ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => removeCv(id),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Ajoutez plusieurs versions de vos CV, renommez-les et choisissez celui à utiliser par défaut
        lors de vos candidatures.
      </Text>

      <View style={styles.list}>
        {user.cvs.map((cv) => {
          const isEditing = editingId === cv.id;
          return (
            <View key={cv.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.icon}>
                  <IconSymbol name="doc.text" size={20} color={Colors.light.tint} />
                </View>
                {isEditing ? (
                  <TextInput
                    value={editingValue}
                    onChangeText={setEditingValue}
                    style={styles.editInput}
                    autoFocus
                  />
                ) : (
                  <View style={styles.cardTitle}>
                    <Text style={styles.cardName}>{cv.name}</Text>
                    <Text style={styles.cardMeta}>{cv.updatedAt}</Text>
                  </View>
                )}
                {cv.isPrimary && <Text style={styles.badge}>CV principal</Text>}
              </View>

              <View style={styles.actions}>
                {isEditing ? (
                  <Pressable
                    onPress={() => handleRename(cv.id)}
                    style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
                    accessibilityRole="button">
                    <IconSymbol name="checkmark" size={18} color="#fff" />
                    <Text style={styles.primaryActionText}>Valider</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => {
                      setEditingId(cv.id);
                      setEditingValue(cv.name);
                    }}
                    style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
                    accessibilityRole="button">
                    <IconSymbol name="pencil" size={16} color={Colors.light.tint} />
                    <Text style={styles.secondaryActionText}>Renommer</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => setPrimaryCv(cv.id)}
                  style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
                  accessibilityRole="button">
                  <IconSymbol
                    name={cv.isPrimary ? 'star.fill' : 'star'}
                    size={16}
                    color={cv.isPrimary ? Colors.light.tint : '#76808A'}
                  />
                  <Text style={styles.secondaryActionText}>Définir par défaut</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleDelete(cv.id)}
                  style={({ pressed }) => [styles.dangerAction, pressed && styles.pressed]}
                  accessibilityRole="button">
                  <IconSymbol name="trash" size={16} color="#D13C3C" />
                  <Text style={styles.dangerActionText}>Supprimer</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {user.cvs.length === 0 && (
          <View style={styles.empty}>
            <IconSymbol name="doc.badge.plus" size={32} color={Colors.light.tint} />
            <Text style={styles.emptyTitle}>Vous n’avez pas encore ajouté de document</Text>
            <Text style={styles.emptySubtitle}>
              Ajoutez au moins un CV pour candidater directement depuis l’app.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.addCard}>
        <Text style={styles.addTitle}>Ajouter un document</Text>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Nom du fichier (ex : CV_mai_2025.pdf)"
          placeholderTextColor="#9AA2AA"
          style={styles.addInput}
        />
        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter à ma bibliothèque</Text>
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
    gap: 20,
    paddingBottom: 40,
  },
  intro: {
    fontSize: 15,
    color: '#4F5962',
    lineHeight: 22,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  cardMeta: {
    fontSize: 13,
    color: '#6B7480',
  },
  badge: {
    backgroundColor: '#E6F0FF',
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  editInput: {
    flex: 1,
    backgroundColor: '#F2F4F8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#202833',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryActionText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2F8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryActionText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  dangerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE6E6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dangerActionText: {
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
  addCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  addTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  addInput: {
    backgroundColor: '#F2F4F8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#202833',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 14,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
