# Parcours fonctionnels manquants

Ce document récapitule les parcours et fonctionnalités encore absents de l'application mobile, en faisant abstraction des futurs appels API.

## Authentification et session
- Ajouter des méthodes de connexion alternatives (email/mot de passe, Apple, etc.) et un flux de récupération de mot de passe.
- Mettre en place une authentification réelle avec persistance sécurisée de la session (AsyncStorage ou équivalent) et rechargement automatique du profil.
- Sauvegarder durablement les préférences utilisateur modifiées.

## Profil, documents et sécurité
- Créer des écrans pour modifier les informations personnelles, gérer les CV/documents et configurer les alertes.
- Implémenter des formulaires réels pour la modification du mot de passe et la suppression de compte, avec validations appropriées.

## Découverte d'offres et alertes
- Remplacer les données statiques par un chargement dynamique (gestion des états de chargement et d'erreur comprise).
- Construire un flux complet de création, d'édition et de suppression d'alertes depuis l'application.

## Recherche d'offres
- Enrichir l'écran de recherche avec des filtres (type de contrat, rythme, rémunération, tri, pagination...).
- Permettre la sauvegarde d'une recherche en tant qu'alerte.

## Détails d'offre et candidature
- Remplacer l'alerte de "Postuler" par un formulaire de candidature complet (message, pièces jointes, validations) et la gestion du suivi de statut.
- Ajouter des actions pour suivre l'entreprise, partager ou sauvegarder l'offre, et gérer les redirections externes si nécessaire.

## Suivi des candidatures
- Connecter la liste aux données réelles et permettre l'ajout manuel d'une candidature, l'édition de son statut et l'ajout de notes.
- Implémenter les actions "Relancer" et "Voir l'offre" avec de véritables navigations ou workflows.

## Notifications
- Ajouter la navigation contextuelle vers la ressource concernée (candidature, alerte...) et la suppression/organisation par catégories.
- Préparer l'intégration à un service de push notifications.

## Écrans restants
- Remplacer l'écran modal générique fourni par Expo par un composant pertinent (ex. aide ou support).
