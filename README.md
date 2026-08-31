# 🇫🇷 Glory of France Clicker

Un jeu de type **clicker/idle** inspiré de Cookie Clicker, centré sur l'histoire et la culture française. Cliquez pour accumuler de la **Gloire** et débloquez des éléments historiques pour générer des points automatiquement !

---

## 🎮 Comment jouer ?

### 🖱️ Mécaniques de base
- **Cliquez** sur la **médaille 🏅** au centre de l'écran pour gagner **1 Point de Gloire** par clic
- **Achetez des bâtiments** dans le panneau de droite pour générer de la Gloire automatiquement
- **Débloquez des améliorations** pour booster votre production
- **Multiplicateurs d'achat** : x1, x5, x50 ou Max pour acheter plusieurs bâtiments d'un coup

### 🏛️ Bâtiments disponibles
Le jeu propose **25 bâtiments historiques** à débloquer, classés par ère historique :

| Ère | Bâtiments | Coût de base | Gain/s |
|-----|-----------|--------------|--------|
| **Antiquité** | Coq Gaulois, Vercingétorix | 10 - 100 G | 0.1 - 1 G |
| **Moyen Âge** | Charlemagne, Notre-Dame, Fleur de Lys, Saint Louis | 1 000 - 100 000 G | 10 - 500 G |
| **Renaissance** | Jeanne d'Arc, Louis XIV | 200 000 - 1 000 000 G | 2 000 - 10 000 G |
| **Révolution** | Révolution, Napoléon | 5 000 000 - 50 000 000 G | 50 000 - 500 000 G |
| **Époque Moderne** | Tour Eiffel, De Gaulle, Macron | 200 000 000 - 5 000 000 000 G | 2 000 000 - 50 000 000 G |
| **Symboles** | Marianne, Liberté, Égalité, Fraternité | 25 000 000 000 - 2 500 000 000 000 G | 250 000 000 - 25 000 000 000 G |
| **Monuments** | Louvre, Champs-Élysées, Arc de Triomphe, Sacré-Cœur | 10 000 000 000 000 - 1 000 000 000 000 000 G | 100 000 000 000 - 10 000 000 000 000 G |
| **Légendaires** | Mont Saint-Michel, Palais de Versailles, Notre-Dame de Paris, République Française | 5 000 000 000 000 000 - 500 000 000 000 000 000 G | 50 000 000 000 000 - 5 000 000 000 000 000 G |

### ⚡ Bonus et événements
- **Bonus aléatoires** : Des bonus temporaires apparaissent périodiquement (baguette magique, croissant doré)
- **Effets visuels** : Animations de clic et notifications
- **Statistiques** : Suivez votre progression dans le menu Statistiques (📊)

### 💾 Sauvegarde
- **Sauvegarde automatique** toutes les 30 secondes
- **Export/Import manuel** via le menu Paramètres (⚙️)
- **Suppression** de la sauvegarde possible

---

## 🚀 Installation & Exécution

### 🌐 Jouer en ligne
Le jeu est conçu pour être hébergé sur n'importe quel service d'hébergement web statique :
- [GitHub Pages](https://pages.github.com/)
- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)
- [Surge](https://surge.sh/)
- N'importe quel hébergement web supportant les fichiers statiques

### 💻 Développement local

#### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Edge, Safari)
- Optionnel : Un serveur local pour le développement (recommandé pour éviter les problèmes CORS)

#### Lancer le jeu localement
1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/Mayeul200/glory-of-france-clicker.git
   cd glory-of-france-clicker
   ```

2. **Ouvrir directement** :
   - Ouvrez simplement `index.html` dans votre navigateur
   - ⚠️ Certaines fonctionnalités peuvent être limitées (CORS)

3. **Avec un serveur local** (recommandé) :
   ```bash
   # Avec Python 3
   python3 -m http.server 8000
   
   # Avec Node.js (npx)
   npx serve
   
   # Avec PHP
   php -S localhost:8000
   ```
   Puis ouvrez [http://localhost:8000](http://localhost:8000) dans votre navigateur.

---

## 📁 Structure du projet

```
glory-of-france-clicker/
├── index.html          # Page principale du jeu
├── script.js           # Logique du jeu (1249 lignes)
├── style.css           # Styles CSS (698 lignes)
├── assets/             # Ressources (images, sons, etc.)
├── README.md           # Documentation principale
└── CONTRIBUTING.md     # Guide de contribution
```

### 📄 Fichiers principaux

| Fichier | Description | Taille |
|--------|-------------|--------|
| `index.html` | Structure HTML du jeu (3 colonnes : mini-jeux, zone de clic, bâtiments) | 94 lignes |
| `script.js` | Toute la logique du jeu (bâtiments, upgrades, sauvegarde, game loop) | 1249 lignes |
| `style.css` | Styles CSS (responsive, animations, thème bleu/blanc/rouge) | 698 lignes |

---

## 🛠️ Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Pas de framework** : Vanilla JS pour une compatibilité maximale
- **Polices** : [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- **Emojis** : Utilisation extensive d'emojis pour l'UI
- **Stockage** : LocalStorage pour les sauvegardes

---

## 📊 Statistiques du jeu

- **25 bâtiments** historiques à débloquer
- **10 améliorations de clic** progressives
- **25 niveaux d'upgrades** pour les bâtiments
- **2 types de bonus** aléatoires
- **Système de sauvegarde** versionné (v5.0.0)
- **Design responsive** (mobile-friendly)

---

## 🎨 Design & UX

### 🎯 Concept
- **Thème** : Bleu, blanc, rouge (couleurs du drapeau français)
- **Style** : Minimaliste, épuré, avec des emojis comme éléments visuels
- **Responsive** : Adapté aux écrans mobile, tablette et desktop

### 🖼️ Interface
- **Barre supérieure** : Boutons Statistiques et Paramètres
- **Colonne gauche** (20%) : Réservée pour les mini-jeux (à développer)
- **Colonne centrale** (60%) : Zone de clic avec la médaille et les améliorations
- **Colonne droite** (20%) : Liste des bâtiments avec multiplicateurs d'achat

### 🎭 Animations
- Effets de clic sur la médaille
- Notifications toast pour les messages
- Bonus aléatoires avec animations
- Transitions fluides

---

## 📦 Déploiement

Voir [DEPLOYMENT.md](docs/DEPLOYMENT.md) pour un guide détaillé de déploiement.

### 🔧 Déploiement rapide avec GitHub Pages

1. Pousser le code sur la branche `main` ou `gh-pages`
2. Aller dans **Settings > Pages** de votre dépôt GitHub
3. Sélectionner la branche et le dossier (`/root` ou `/docs`)
4. Le jeu sera disponible à `https://[votre-username].github.io/glory-of-france-clicker/`

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour savoir comment contribuer au projet.

### 💡 Idées d'améliorations
- Ajouter plus de bâtiments historiques
- Implémenter des mini-jeux dans le panneau gauche
- Ajouter un système de prestiges
- Intégrer des sons et musiques
- Améliorer les animations
- Ajouter un système de quêtes
- Implémenter un classement (leaderboard)

---

## 📜 Licence

Ce projet est open source. Vous êtes libre de :
- Jouer au jeu
- Modifier le code
- Redistribuer le jeu
- Utiliser le code pour vos propres projets

Attribution appréciée mais non obligatoire.

---

## 📞 Contact & Support

- **Problèmes/bugs** : Ouvrez une [issue](https://github.com/Mayeul200/glory-of-france-clicker/issues) sur GitHub
- **Questions** : Consultez la documentation ou ouvrez une discussion
- **Contributions** : Les pull requests sont les bienvenues !

---

## 🏆 Remerciements

- Inspiré par [Cookie Clicker](https://orteil.dashnet.org/cookieclicker/)
- Créé avec passion pour la France et son histoire
- Merci à tous les contributeurs et joueurs !

---

*Made with ❤️ for France*
