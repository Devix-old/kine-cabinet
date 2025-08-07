# Cabinet de Kinésithérapie - Application de Gestion

Application web moderne pour la gestion d'un cabinet de kinésithérapie, développée avec Next.js, Prisma et PostgreSQL.

## 🚀 Fonctionnalités

- **Gestion des Patients** : CRUD complet avec numéros de dossier uniques
- **Rendez-vous** : Planification, gestion des créneaux, conflits automatiques
- **Traitements** : Suivi des traitements et sessions
- **Dossiers Médicaux** : Gestion des documents et notes
- **Statistiques** : Tableaux de bord et rapports
- **Gestion des Salles** : Planification des ressources
- **Tarifs** : Gestion des prestations et prix

## 🛠️ Technologies

- **Frontend** : Next.js 15, React 19, Tailwind CSS
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de données** : PostgreSQL
- **Authentification** : bcryptjs (à étendre avec NextAuth.js)
- **UI Components** : Headless UI, Lucide React

## 📁 Structure du Projet

```
kine-cabinet/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── api/               # API Routes
│   │   │   ├── patients/      # Gestion des patients
│   │   │   ├── appointments/  # Gestion des rendez-vous
│   │   │   ├── rooms/         # Gestion des salles
│   │   │   └── tarifs/        # Gestion des tarifs
│   │   ├── patients/          # Page patients
│   │   ├── rendez-vous/       # Page rendez-vous
│   │   └── ...
│   ├── components/            # Composants React
│   │   ├── Layout/           # Layout et navigation
│   │   └── UI/               # Composants UI réutilisables
│   ├── contexts/             # Contextes React
│   ├── hooks/                # Hooks personnalisés
│   └── lib/                  # Utilitaires et configuration
├── prisma/                   # Schéma de base de données
├── scripts/                  # Scripts utilitaires
└── public/                   # Assets statiques
```

## 🗄️ Base de Données

### Modèles Principaux

- **User** : Utilisateurs (Kiné, Secrétaire, Admin)
- **Patient** : Patients avec numéros de dossier uniques
- **Appointment** : Rendez-vous avec gestion des conflits
- **Treatment** : Traitements et sessions
- **MedicalRecord** : Dossiers médicaux
- **Document** : Gestion des fichiers
- **Room** : Salles de consultation
- **Tarif** : Tarifs des prestations

### Relations

- Patient ↔ Appointment (1:N)
- Patient ↔ Treatment (1:N)
- Patient ↔ MedicalRecord (1:N)
- User ↔ Appointment (1:N) - Kiné assigné
- Room ↔ Appointment (1:N)
- Tarif ↔ Appointment (1:N)

## 🚀 Installation et Configuration

### 1. Prérequis

- Node.js 18+
- PostgreSQL
- npm ou yarn

### 2. Installation

```bash
# Cloner le projet
git clone <repository-url>
cd kine-cabinet

# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env
# Éditer .env avec vos informations PostgreSQL
```

### 3. Configuration de la Base de Données

```bash
# Créer la base de données PostgreSQL
createdb kine_cabinet

# Appliquer le schéma
npx prisma db push

# Initialiser avec des données de base
node scripts/seed.js
```

### 4. Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

## 🔐 Authentification

### Compte par défaut

- **Email** : admin@cabinet.com
- **Mot de passe** : admin123

⚠️ **Important** : Changez le mot de passe en production !

## 📊 API Endpoints

### Patients
- `GET /api/patients` - Liste des patients
- `POST /api/patients` - Créer un patient
- `GET /api/patients/[id]` - Détails d'un patient
- `PUT /api/patients/[id]` - Modifier un patient
- `DELETE /api/patients/[id]` - Supprimer un patient

### Rendez-vous
- `GET /api/appointments` - Liste des rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `GET /api/appointments/[id]` - Détails d'un rendez-vous
- `PUT /api/appointments/[id]` - Modifier un rendez-vous
- `DELETE /api/appointments/[id]` - Annuler un rendez-vous

### Références
- `GET /api/rooms` - Liste des salles
- `GET /api/tarifs` - Liste des tarifs

## 🎨 Interface Utilisateur

### Composants Principaux

- **DashboardLayout** : Layout principal avec sidebar
- **Sidebar** : Navigation principale
- **Toast** : Notifications système
- **Modal** : Modales pour formulaires

### Hooks Personnalisés

- **useApi** : Gestion des appels API
- **useToast** : Gestion des notifications
- **useToastContext** : Contexte des notifications

## 🔧 Scripts Utilitaires

```bash
# Test de connexion à la base de données
node test-db.js

# Initialisation de la base de données
node scripts/seed.js

# Génération du client Prisma
npx prisma generate

# Visualisation de la base de données
npx prisma studio
```

## 📈 Fonctionnalités Avancées

### Gestion des Conflits
- Vérification automatique des créneaux disponibles
- Prévention des doublons de rendez-vous
- Gestion des salles et kinés

### Numérotation Automatique
- Génération automatique des numéros de dossier
- Format : K[ANNÉE][MOIS][NUMÉRO]
- Exemple : K202501001

### Soft Delete
- Suppression logique (marquage inactif)
- Conservation de l'historique
- Possibilité de restauration

## 🚀 Déploiement

### Variables d'Environnement

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/kine_cabinet"

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Environnement
NODE_ENV="production"
```

### Plateformes Recommandées

- **Vercel** : Déploiement automatique
- **Railway** : Base de données PostgreSQL incluse
- **Heroku** : Déploiement simple

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 🆘 Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les issues existantes
3. Créer une nouvelle issue avec les détails

---

**Développé avec ❤️ pour les professionnels de la kinésithérapie**
