# Scripts de Génération de Données de Test - Cabinet de Kinésithérapie

Ce dossier contient des scripts pour générer et gérer des données de test réalistes pour un cabinet de kinésithérapie.

## 🎯 Objectif

Ces scripts permettent de créer rapidement un jeu de données complet pour tester toutes les fonctionnalités de l'application :
- **Patients** avec informations complètes
- **Rendez-vous** sur plusieurs semaines
- **Traitements** de kinésithérapie
- **Séances** de rééducation
- **Dossiers médicaux** détaillés
- **Documents** et **Notes** cliniques
- **Salles** de soin

## 📋 Prérequis

1. **Cabinet de kinésithérapie** créé dans l'application
2. **Utilisateur** associé au cabinet
3. **Base de données** accessible
4. **Dépendances** installées :
   ```bash
   npm install @faker-js/faker --save-dev
   ```

## 🚀 Utilisation

### Générer des données de test

```bash
# Méthode recommandée
npm run generate-test-data

# Ou directement
node scripts/run-test-data-generation.js
```

### Nettoyer les données de test

```bash
# Supprimer toutes les données de test
npm run clean-test-data

# Ou directement
node scripts/clean-test-data.js
```

## 📊 Données générées

### Patients (15 patients)
- **Informations personnelles** : nom, prénom, date de naissance, sexe
- **Coordonnées** : téléphone, email, adresse
- **Données médicales** : médecin traitant, antécédents, allergies
- **Professions** variées et réalistes

### Rendez-vous (60-80 RDV)
- **Période** : 7 jours passés + 14 jours futurs
- **Horaires** : 8h-12h et 14h-18h
- **Types** : Consultation, Séance, Bilan, Suivi, Urgence
- **Statuts** : Planifié, Confirmé, Terminé, En cours
- **Motifs** : Pathologies de kinésithérapie

### Traitements (20-45 traitements)
- **Pathologies** : Lombalgie, entorse, tendinite, etc.
- **Objectifs** : Récupération, renforcement, mobilité
- **Durée** : 10-30 séances
- **Statuts** : Actif, Terminé, En pause

### Séances (100-400 séances)
- **Types** : Séance, Évaluation, Rééducation
- **Techniques** : Massage, mobilisation, électrothérapie
- **Observations** : Évolution, douleur, progression
- **Durée** : 30, 45 ou 60 minutes

### Dossiers médicaux (30-75 dossiers)
- **Types** : Diagnostic, Prescription, Bilan, Compte-rendu, Suivi
- **Contenu** : Détaillé et professionnel
- **Dates** : Réparties sur 60 jours

### Documents (15-60 documents)
- **Types** : PDF, Image, Scan, Radio
- **Noms** : Ordonnances, radios, bilans, certificats
- **Tailles** : Réalistes (100KB - 5MB)

### Notes (45-135 notes)
- **Types** : Générale, Clinique, Suivi
- **Contenu** : Observations professionnelles
- **Confidentialité** : Notes privées/publiques

### Salles (4 salles)
- **Salle 1** : Rééducation principale
- **Salle 2** : Massage thérapeutique
- **Salle 3** : Électrothérapie
- **Gymnase** : Exercices collectifs

## 🎨 Personnalisation

### Modifier le nombre de patients

Dans `generate-kine-test-data.js`, ligne 282 :
```javascript
await this.createPatients(15) // Changer le nombre ici
```

### Ajouter des pathologies

Dans `KINE_DATA.pathologies` :
```javascript
pathologies: [
  'Votre nouvelle pathologie',
  // ... autres pathologies
]
```

### Modifier la période des RDV

Dans `createAppointments()` :
```javascript
// Changer les valeurs -7 et 14 pour la période
for (let dayOffset = -7; dayOffset <= 14; dayOffset++) {
```

## 🔧 Configuration avancée

### Types de rendez-vous spécifiques
Modifiez `appointmentTypes` dans `createAppointments()` pour utiliser uniquement les types appropriés à la kinésithérapie.

### Horaires personnalisés
Ajustez les heures de travail dans `createAppointments()` :
```javascript
const hour = isAfternoon ? 
  faker.number.int({ min: 14, max: 17 }) : // Après-midi
  faker.number.int({ min: 8, max: 11 })    // Matin
```

### Techniques de kinésithérapie
Personnalisez `KINE_DATA.techniques` selon votre pratique.

## 🐛 Résolution de problèmes

### Erreur "Aucun cabinet de kinésithérapie trouvé"
1. Connectez-vous à l'application
2. Créez un cabinet de type "KINESITHERAPIE"
3. Relancez le script

### Erreur "Aucun utilisateur trouvé"
1. Vérifiez qu'un utilisateur est associé au cabinet
2. Consultez la table `users` dans la base de données

### Conflits de créneaux
Le script évite automatiquement les conflits de rendez-vous en vérifiant les créneaux existants.

### Doublons de salles
Si les salles existent déjà, le script les réutilise au lieu de créer des doublons.

## 📝 Logs et monitoring

Les scripts affichent des logs détaillés :
- ✅ Succès des créations
- ⚠️ Avertissements (doublons)
- ❌ Erreurs avec détails
- 📊 Statistiques finales

## 🔒 Sécurité

- Les données sont **fictives** et générées aléatoirement
- Aucune donnée personnelle réelle n'est utilisée
- Le script fonctionne uniquement sur les cabinets de type `KINESITHERAPIE`

## 🚨 Important

- **Sauvegardez** votre base de données avant utilisation
- Testez d'abord sur un environnement de développement
- Le nettoyage est **irréversible**

## 📞 Support

En cas de problème :
1. Vérifiez les prérequis
2. Consultez les logs d'erreur
3. Vérifiez la configuration de la base de données
4. Testez la connexion Prisma

---

🎉 **Bon test avec vos nouvelles données !**

