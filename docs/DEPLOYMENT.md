# 🚀 Guide de Déploiement - Glory of France Clicker

Ce guide vous explique comment déployer **Glory of France Clicker** sur différentes plateformes d'hébergement.

---

## 📋 Table des matières

1. [Prérequis](#-prérequis)
2. [Déploiement Local](#-déploiement-local)
3. [GitHub Pages](#-github-pages)
4. [Netlify](#-netlify)
5. [Vercel](#-vercel)
6. [Surge.sh](#-surgesh)
7. [Firebase Hosting](#-firebase-hosting)
8. [Hébergement Personnalisé](#-hébergement-personnalisé)
9. [Vérification Post-Déploiement](#-vérification-post-déploiement)
10. [Dépannage](#-dépannage)

---

## ✅ Prérequis

Avant de déployer, assurez-vous que :

- [ ] Le code est dans un état stable (pas de bugs majeurs)
- [ ] Tous les fichiers nécessaires sont présents (`index.html`, `script.js`, `style.css`)
- [ ] Les assets (images, sons) sont correctement référencés
- [ ] Le jeu fonctionne correctement en local

---

## 💻 Déploiement Local

Pour tester le jeu avant déploiement.

### Méthode 1 : Ouvrir directement le fichier

1. Naviguez jusqu'au dossier du projet
2. Double-cliquez sur `index.html`
3. Le jeu s'ouvre dans votre navigateur par défaut

⚠️ **Limitations** :
- Certaines fonctionnalités peuvent ne pas fonctionner (CORS)
- La sauvegarde peut ne pas persister entre les sessions

### Méthode 2 : Utiliser un serveur local

#### Avec Python 3

```bash
# Naviguez jusqu'au dossier
cd /chemin/vers/glory-of-france-clicker

# Lancez le serveur (port 8000 par défaut)
python3 -m http.server 8000

# Ou sur un port spécifique
python3 -m http.server 3000
```

Ouvrez [http://localhost:8000](http://localhost:8000) dans votre navigateur.

#### Avec Node.js (npx)

```bash
# Installer serve globalement (optionnel)
npm install -g serve

# Ou utiliser npx (pas besoin d'installation)
npx serve

# Sur un port spécifique
npx serve -p 3000
```

Ouvrez [http://localhost:3000](http://localhost:3000).

#### Avec PHP

```bash
php -S localhost:8000
```

Ouvrez [http://localhost:8000](http://localhost:8000).

#### Avec Live Server (VS Code)

1. Installez l'extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Ouvrez le dossier du projet dans VS Code
3. Cliquez sur "Go Live" dans la barre d'état
4. Le jeu s'ouvre automatiquement dans votre navigateur

---

## 🌐 GitHub Pages

**Recommandé** pour un déploiement simple et gratuit.

### Étapes

#### 1. Créer un dépôt GitHub (si ce n'est pas déjà fait)

- Allez sur [GitHub](https://github.com/new)
- Créez un nouveau dépôt (ex: `glory-of-france-clicker`)
- Initialisez-le avec un README

#### 2. Pousser votre code

```bash
# Initialiser git (si ce n'est pas déjà fait)
git init

# Ajouter le remote
git remote add origin https://github.com/votre-username/glory-of-france-clicker.git

# Ajouter les fichiers
git add .

# Commiter
git commit -m "Initial commit - Glory of France Clicker"

# Pousser sur main
git push -u origin main
```

#### 3. Activer GitHub Pages

1. Allez sur votre dépôt GitHub
2. Cliquez sur **Settings** (Paramètres)
3. Dans la barre latérale, cliquez sur **Pages**
4. Sous "Source", sélectionnez :
   - **Branch** : `main` (ou `master`)
   - **Folder** : `/root` (ou `/docs` si vos fichiers sont dans un dossier docs)
5. Cliquez sur **Save**

#### 4. Accéder à votre site

Après quelques minutes, votre site sera disponible à :
```
https://votre-username.github.io/glory-of-france-clicker/
```

### Configuration avancée

#### Utiliser un domaine personnalisé

1. Achetez un nom de domaine (ex: sur [Namecheap](https://www.namecheap.com/), [OVH](https://www.ovh.com/))
2. Dans les paramètres Pages de votre dépôt :
   - Ajoutez votre domaine dans "Custom domain"
   - Cliquez sur **Save**
3. Configurez les DNS de votre domaine :
   - Ajoutez un enregistrement CNAME pointant vers `votre-username.github.io`
   - Ou des enregistrements A pointant vers les IP de GitHub Pages

#### Forcer HTTPS

1. Dans les paramètres Pages
2. Cochez "Enforce HTTPS"

### Limitations

- Taille maximale du dépôt : 1 Go (soft limit)
- Taille maximale d'un fichier : 100 Mo
- Bande passante : ~100 Go/mois
- Pas de backend (PHP, Node.js, etc.)

---

## 🌈 Netlify

**Parfait** pour un déploiement continu (CI/CD).

### Étapes

#### 1. S'inscrire sur Netlify

- Allez sur [https://www.netlify.com/](https://www.netlify.com/)
- Inscrivez-vous avec GitHub, GitLab, Bitbucket ou email

#### 2. Créer un nouveau site

1. Cliquez sur **Add new site** > **Import an existing project**
2. Sélectionnez **GitHub** (ou votre fournisseur Git)
3. Autorisez Netlify à accéder à vos dépôts
4. Sélectionnez votre dépôt `glory-of-france-clicker`

#### 3. Configurer le déploiement

1. **Branch to deploy** : `main` (ou `master`)
2. **Build command** : Laissez vide (pas de build nécessaire)
3. **Publish directory** : Laissez vide (ou `.` pour la racine)
4. Cliquez sur **Deploy site**

#### 4. Accéder à votre site

Votre site sera déployé et disponible à une URL du type :
```
https://votre-site.netlify.app
```

### Configuration avancée

#### Déploiement continu

Netlify déploie automatiquement à chaque push sur la branche sélectionnée.

#### Domaine personnalisé

1. Allez dans **Site settings** > **Domain management**
2. Cliquez sur **Add custom domain**
3. Suivez les instructions pour configurer votre domaine

#### Variables d'environnement

1. Allez dans **Site settings** > **Environment variables**
2. Ajoutez vos variables si nécessaire

### netlify.toml (optionnel)

Créez un fichier `netlify.toml` à la racine pour une configuration avancée :

```toml
[build]
  publish = "."
  command = "echo 'No build command needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[headers]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

## ⚡ Vercel

**Excellent** pour les performances et le déploiement instantané.

### Étapes

#### 1. S'inscrire sur Vercel

- Allez sur [https://vercel.com/](https://vercel.com/)
- Inscrivez-vous avec GitHub, GitLab, Bitbucket ou email

#### 2. Importer votre projet

1. Cliquez sur **Add New** > **Project**
2. Sélectionnez **GitHub** (ou votre fournisseur)
3. Sélectionnez votre dépôt `glory-of-france-clicker`
4. Cliquez sur **Import**

#### 3. Configurer le déploiement

1. **Project Name** : `glory-of-france-clicker`
2. **Framework Preset** : Sélectionnez **Other** (ou laissez vide)
3. **Build Command** : Laissez vide
4. **Output Directory** : Laissez vide (ou `.` pour la racine)
5. **Environment Variables** : Ajoutez si nécessaire
6. Cliquez sur **Deploy**

#### 4. Accéder à votre site

Votre site sera disponible à :
```
https://glory-of-france-clicker.vercel.app
```

### Configuration avancée

#### Déploiement continu

Vercel déploie automatiquement à chaque push.

#### Domaine personnalisé

1. Allez dans votre projet > **Settings** > **Domains**
2. Cliquez sur **Add Domain**
3. Suivez les instructions

#### vercel.json (optionnel)

Créez un fichier `vercel.json` pour une configuration avancée :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html",
      "status": 200
    }
  ]
}
```

---

## 🌊 Surge.sh

**Simple et rapide** pour un déploiement temporaire ou de test.

### Étapes

#### 1. Installer Surge

```bash
# Avec npm
npm install -g surge

# Ou avec yarn
yarn global add surge
```

#### 2. Déployer

```bash
# Naviguez jusqu'au dossier du projet
cd /chemin/vers/glory-of-france-clicker

# Déployez
surge
```

#### 3. Suivre les instructions

Surge vous demandera :
- Le chemin du projet (laisser vide pour le dossier courant)
- Un domaine pour votre site (laisser vide pour un domaine aléatoire)

#### 4. Accéder à votre site

Votre site sera disponible à une URL du type :
```
https://votre-site.surge.sh
```

### Configuration avancée

#### Déployer avec un domaine spécifique

```bash
surge --domain votre-domaine.surge.sh
```

#### Déployer en arrière-plan

```bash
# Créez un fichier CNAME
 echo "votre-domaine.surge.sh" > CNAME

# Déployez
surge
```

### Limitations

- Taille maximale : 100 Mo
- Bande passante : limitée (gratuit pour les petits projets)
- Pas de HTTPS personnalisé sur la version gratuite

---

## 🔥 Firebase Hosting

**Idéal** si vous prévoyez d'ajouter un backend plus tard.

### Étapes

#### 1. Installer Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2. S'authentifier

```bash
firebase login
```

#### 3. Initialiser Firebase

```bash
# Naviguez jusqu'au dossier du projet
cd /chemin/vers/glory-of-france-clicker

# Initialisez Firebase
firebase init
```

Sélectionnez :
- **Hosting: Configure and deploy Firebase Hosting sites**
- **Use an existing project** ou **Create a new project**
- **What do you want to use as your public directory?** : `.` (ou `public` si vos fichiers sont dans un dossier public)
- **Configure as a single-page app?** : `n` (non)
- **Set up automatic builds and deploys with GitHub?** : `n` (optionnel)

#### 4. Déployer

```bash
firebase deploy --only hosting
```

#### 5. Accéder à votre site

Votre site sera disponible à :
```
https://votre-projet.web.app
ou
https://votre-projet.firebaseapp.com
```

### Configuration avancée

#### firebase.json

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### Déploiement continu avec GitHub

```bash
# Lors de l'initialisation, sélectionnez Yes pour GitHub
firebase init hosting

# Ou configurez manuellement
firebase deploy --only hosting
```

---

## 🖥️ Hébergement Personnalisé

Si vous avez votre propre serveur (VPS, hébergement mutualisé, etc.).

### Méthode 1 : Upload via FTP

#### 1. Installer un client FTP

- [FileZilla](https://filezilla-project.org/) (gratuit)
- [Cyberduck](https://cyberduck.io/) (gratuit)
- [WinSCP](https://winscp.net/) (Windows)

#### 2. Se connecter à votre serveur

- **Hôte** : ftp.votre-hebergeur.com (ou l'IP du serveur)
- **Identifiant** : votre identifiant FTP
- **Mot de passe** : votre mot de passe FTP
- **Port** : 21 (par défaut)

#### 3. Upload des fichiers

- Naviguez jusqu'au dossier public de votre hébergement (souvent `public_html`, `htdocs`, ou `www`)
- Upload tous les fichiers du projet (`index.html`, `script.js`, `style.css`, `assets/`)

#### 4. Accéder à votre site

Votre site sera disponible à :
```
http://votre-domaine.com
ou
http://votre-serveur-ip/
```

### Méthode 2 : Via SSH/SCP

#### Upload avec SCP

```bash
# Copier les fichiers vers le serveur
scp -r index.html script.js style.css assets/ utilisateur@serveur:/chemin/vers/public_html/
```

#### Sync avec rsync

```bash
# Synchronisation incrémentale
rsync -avz --delete ./ utilisateur@serveur:/chemin/vers/public_html/
```

### Méthode 3 : Git Pull sur le serveur

#### 1. Cloner le dépôt sur le serveur

```bash
# Sur le serveur
git clone https://github.com/votre-username/glory-of-france-clicker.git /chemin/vers/public_html/
```

#### 2. Configurer un hook de déploiement

Créez un script `deploy.sh` :

```bash
#!/bin/bash
cd /chemin/vers/public_html/
git pull origin main
```

#### 3. Configurer un webhook GitHub

1. Allez dans les paramètres de votre dépôt GitHub
2. Cliquez sur **Webhooks** > **Add webhook**
3. **Payload URL** : `https://votre-domaine.com/deploy.php` (ou l'URL de votre script)
4. **Content type** : `application/json`
5. **Secret** : (optionnel) une clé secrète
6. **Events** : Sélectionnez **Just the push event**

#### 4. Créer un endpoint de déploiement (PHP)

Créez un fichier `deploy.php` :

```php
<?php
// Vérifier le secret si configuré
$secret = 'votre-secret';
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE'];
$payload = file_get_contents('php://input');

if ($signature && $secret) {
    $hash = 'sha1=' . hash_hmac('sha1', $payload, $secret);
    if ($signature !== $hash) {
        http_response_code(403);
        die('Accès refusé');
    }
}

// Exécuter le script de déploiement
exec('/bin/bash /chemin/vers/deploy.sh 2>&1', $output, $return);

// Retourner le résultat
header('Content-Type: text/plain');
echo implode("\n", $output);
http_response_code($return === 0 ? 200 : 500);
```

---

## ✅ Vérification Post-Déploiement

Après le déploiement, vérifiez que tout fonctionne correctement :

### 1. Fonctionnalités de base

- [ ] Le jeu se charge sans erreur
- [ ] Le clic sur la médaille fonctionne
- [ ] Les bâtiments s'affichent correctement
- [ ] L'achat de bâtiments fonctionne
- [ ] Les améliorations s'affichent et fonctionnent
- [ ] Les bonus aléatoires apparaissent

### 2. Sauvegarde

- [ ] La sauvegarde automatique fonctionne
- [ ] L'export/import manuel fonctionne
- [ ] La suppression de sauvegarde fonctionne

### 3. Statistiques

- [ ] Les statistiques s'affichent correctement
- [ ] Les valeurs sont mises à jour

### 4. Responsive Design

- [ ] Le jeu s'affiche correctement sur mobile
- [ ] Le jeu s'affiche correctement sur tablette
- [ ] Le jeu s'affiche correctement sur desktop

### 5. Performances

- [ ] Le jeu est fluide (pas de lag)
- [ ] Les animations sont fluides
- [ ] Le chargement est rapide

### 6. Console

- [ ] Aucune erreur dans la console (F12 > Console)
- [ ] Aucune erreur 404 pour les fichiers

---

## 🐛 Dépannage

### Problèmes courants

#### 1. Le jeu ne se charge pas

**Symptômes** : Page blanche, erreur 404

**Solutions** :
- Vérifiez que `index.html` est à la racine
- Vérifiez que les chemins des fichiers sont corrects (relatifs, pas absolus)
- Vérifiez les permissions des fichiers (644 pour les fichiers, 755 pour les dossiers)

#### 2. Les styles ne s'appliquent pas

**Symptômes** : Page sans style, HTML brut

**Solutions** :
- Vérifiez que `style.css` est correctement lié dans `index.html`
- Vérifiez le chemin : `<link rel="stylesheet" href="style.css">`
- Vérifiez que le fichier CSS existe sur le serveur

#### 3. Le JavaScript ne fonctionne pas

**Symptômes** : Rien ne se passe quand on clique

**Solutions** :
- Vérifiez que `script.js` est correctement lié dans `index.html`
- Vérifiez le chemin : `<script src="script.js"></script>`
- Ouvrez la console (F12) pour voir les erreurs
- Vérifiez que le fichier JS existe sur le serveur

#### 4. Erreurs CORS

**Symptômes** : Erreurs dans la console comme "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solutions** :
- Assurez-vous que tous les fichiers sont servis depuis le même domaine
- Évitez d'utiliser des URLs absolues pour les assets
- Si vous utilisez des APIs externes, configurez CORS côté serveur

#### 5. La sauvegarde ne fonctionne pas

**Symptômes** : La sauvegarde n'est pas conservée entre les sessions

**Solutions** :
- Vérifiez que LocalStorage est supporté par le navigateur
- Vérifiez qu'il n'y a pas d'erreur dans la console
- Assurez-vous que le site est servi en HTTPS (LocalStorage nécessite un contexte sécurisé sur certains navigateurs)

#### 6. Les images ne s'affichent pas

**Symptômes** : Les emojis ou images ne s'affichent pas

**Solutions** :
- Vérifiez les chemins des images dans le CSS et HTML
- Assurez-vous que les fichiers images existent sur le serveur
- Vérifiez les permissions des fichiers images

### Outils de diagnostic

#### 1. Chrome DevTools

- **Console** : Pour voir les erreurs JavaScript
- **Network** : Pour voir les requêtes et erreurs 404
- **Application** > **Local Storage** : Pour vérifier la sauvegarde
- **Elements** : Pour inspecter le DOM

#### 2. Lighthouse (Audit)

1. Ouvrez DevTools (F12)
2. Allez dans l'onglet **Lighthouse**
3. Cliquez sur **Generate report**
4. Analysez les résultats pour les problèmes de performance, accessibilité, etc.

#### 3. Validateurs

- **HTML** : [W3C Validator](https://validator.w3.org/)
- **CSS** : [W3C CSS Validator](https://jigsaw.w3.org/css-validator/)
- **JavaScript** : [ESLint](https://eslint.org/) (en local)

---

## 📊 Comparatif des Hébergeurs

| Hébergeur | Gratuit | HTTPS | Domaine Personnalisé | CI/CD | Limites | Lien |
|-----------|---------|-------|---------------------|-------|---------|------|
| GitHub Pages | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui | 1 Go, 100 Go/mois | [github.com](https://pages.github.com/) |
| Netlify | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui | Généreux | [netlify.com](https://www.netlify.com/) |
| Vercel | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui | Généreux | [vercel.com](https://vercel.com/) |
| Surge.sh | ✅ Oui | ❌ Non (gratuit) | ❌ Non | ❌ Non | 100 Mo | [surge.sh](https://surge.sh/) |
| Firebase Hosting | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui | 1 Go, 10 Go/mois | [firebase.google.com](https://firebase.google.com/) |
| Hébergement Personnalisé | ❌ Dépend | ✅ Oui | ✅ Oui | ❌ Non | Dépend | - |

---

## 🎯 Recommandations

| Cas d'usage | Hébergeur Recommandé |
|-------------|---------------------|
| **Débutant, simple** | GitHub Pages |
| **Déploiement continu** | Netlify ou Vercel |
| **Test rapide** | Surge.sh |
| **Backend futur** | Firebase Hosting |
| **Contrôle total** | Hébergement Personnalisé |
| **Performance** | Vercel |
| **Simplicité** | GitHub Pages |

---

## 📞 Support

Si vous rencontrez des problèmes de déploiement :

1. **Vérifiez ce guide** : La plupart des problèmes sont couverts ici
2. **Consultez la documentation** de votre hébergeur
3. **Recherchez sur Google** : "[votre problème] + [nom de l'hébergeur]"
4. **Ouvrez une issue** sur GitHub avec :
   - Le nom de l'hébergeur
   - L'URL de votre déploiement
   - Les erreurs dans la console
   - Les étapes que vous avez suivies

---

*Bon déploiement !* 🚀
