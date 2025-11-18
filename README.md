# Frontend - Gestion Utilisateurs & Messagerie

## Table des matières

- [Frontend - Gestion Utilisateurs \& Messagerie](#frontend---gestion-utilisateurs--messagerie)
  - [Table des matières](#table-des-matières)
  - [Présentation](#présentation)
  - [Technologies utilisées](#technologies-utilisées)
  - [Structure du projet](#structure-du-projet)
  - [Installation](#installation)

---

## Présentation

Ce frontend est une application **React + TypeScript** pour gérer les utilisateurs, la messagerie interne, les dossiers et les notifications.  
Il est conçu pour un usage administratif et permet de suivre l'activité des utilisateurs et leurs messages.

---

## Technologies utilisées

- **React 18+** avec TypeScript
- **React Router DOM v6** pour le routage
- **Tailwind CSS** pour le design
- **Axios** pour les requêtes API
- **Lucide-React** pour les icônes
- **Context API** pour la gestion de l’authentification et des routes protégées
- **Modals / Toasts** pour les interactions utilisateur

---

## Structure du projet

src/
├─ api/ # Configuration Axios pour les appels API
├─ components/ # Composants réutilisables (Toast, Modals, Buttons)
├─ context/ # Context API pour Auth et ProtectedRoute
├─ models/ # Types TypeScript pour Users, Messages, etc.
├─ pages/ # Pages principales (Users, Messaging, Login)
├─ services/ # Services pour communiquer avec le backend
├─ Routes/ # Définition des routes de l'application
├─ App.tsx # Composant racine de l'application
├─ index.tsx # Point d'entrée de l'application
└─ index.css # Styles globaux

yaml
Copier le code

---

## Installation

1. Cloner le projet :

```bash
git clone <URL_DU_REPO>
cd frontend
Installer les dépendances :

bash
Copier le code
npm install
Démarrer le projet :

bash
Copier le code
npm run dev
Accéder à l'application : http://localhost:5173/ (Vite par défaut)

Fonctionnalités
Authentification
Login et mot de passe oublié

Routes protégées via ProtectedRoute

Redirection automatique si non authentifié

Dashboard Admin
Tableau de bord avec statistiques (total utilisateurs, actifs, admins)

Navigation vers les pages : utilisateurs et messages

Gestion des utilisateurs
Liste complète avec recherche, filtres et pagination

Ajout, modification et suppression des utilisateurs

Statut actif/inactif toggle

Détails d’un utilisateur via modal

Export des données

Messagerie
Inbox, envoyés, brouillons, favoris, archivés, corbeille

Envoyer un message avec pièces jointes

Archiver / désarchiver, marquer comme lu / favoris

Détails d’un message et conversation

Suppression / restauration des messages

Statistiques (non lus, brouillons, archivés, favoris, corbeille)

Notifications
Toasts pour succès / erreur

Système en temps réel (si backend supporté)

Composants principaux
AppRoutes : Routes principales avec BrowserRouter et ProtectedRoute

UserList : Liste des utilisateurs avec gestion complète

AddOrEditUser : Modal pour ajouter ou éditer un utilisateur

UserDetail : Modal pour afficher le détail complet d’un utilisateur

MessageList / InboxPage / SentPage / DraftsPage / ArchivedPage / FavoritesPage / TrashPage : Gestion complète des messages

Toast : Composant d’alerte pour les notifications

MessagingLayout / AdminDashboardLayout : Layouts pour messagerie et dashboard

Services / API
userService.ts : CRUD utilisateurs, activation/désactivation

messageService.ts : Gestion complète des messages (envoyer, archiver, favoris, corbeille)

axios.config.ts : Configuration Axios avec baseURL et JWT

Routage
/login : Page de connexion

/forgot-password : Mot de passe oublié

/admin/users : Liste utilisateurs

/admin/messages : Liste messages administrateurs

/messaging/* : Messagerie interne avec inbox, envoyés, brouillons, archivés, favoris, corbeille

Routes protégées pour tout accès utilisateur / admin

Styles et UI
Tailwind CSS avec classes utilitaires

Design moderne avec coins arrondis, ombrages doux et responsive

Icônes via lucide-react

Composants interactifs : boutons, modals, toasts, tables

Exécution du projet
Lancer le frontend :

bash
Copier le code
npm run dev
Build pour production :

bash
Copier le code
npm run build
Serveur de production (si Vite) :

bash
Copier le code
npm run preview
Notes pour les développeurs
Tous les composants modals et forms utilisent React Hook Form ou state local pour gérer les données.

Les filtres et recherches dans les listes sont dynamiques et réactifs.

Ajouter de nouvelles pages : créer le composant dans pages/ et l'ajouter dans AppRoutes.

Pour chaque service, respecter le type TypeScript défini dans models/.

Auteur : Camara Karifa
Projet : Application de gestion utilisateurs et messagerie
```
