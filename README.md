# 🚗 DriveNow — Frontend React

Application React pour la plateforme de location de voitures **DriveNow**.  
Développé dans le cadre de l'Examen Final NestJS — Licence 2 Génie Informatique, UNIPRO Dakar.

---

## 👥 Membres du groupe

- Babacar Junior Traore
- Seynabou Ba
- Jeannoth Pierroth
- Deguène Kandji

---

## 🛠️ Technologies utilisées

| Technologie | Rôle |
|---|---|
| React + TypeScript | Framework frontend |
| Vite | Bundler |
| Tailwind CSS | Styles |
| Framer Motion | Animations |
| Recharts | Graphiques |
| React Router | Navigation |
| Docker + Nginx | Containerisation |
| GitHub Actions | Pipeline CI/CD |
| Vercel | Déploiement |

---

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+
- Backend DriveNow démarré sur `http://localhost:3000`

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/babsjunior2004-ctrl/drivenow-frontend.git
cd drivenow-frontend

# 2. Installer les dépendances
npm install

# 3. Démarrer en développement
npm run dev
# → http://localhost:5173
```

---

## 🔑 Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| ADMIN | admin@drivenow.sn | Admin123! |
| CLIENT | Créer via l'interface | Au choix (6 car. min) |

---

## 📱 Pages disponibles

| Page | URL | Accès |
|---|---|---|
| Accueil | / | Public |
| Flotte de voitures | /cars | Public |
| Connexion | /login | Public |
| Inscription | /register | Public |
| Tableau de bord | /dashboard | AUTH |
| Réservations | /reservations | CLIENT |
| Administration | /admin | ADMIN |
| Profil | /profile | AUTH |

---

## ✅ Fonctionnalités

- ✅ Authentification JWT (connexion, inscription, déconnexion)
- ✅ Interface CLIENT — réserver, consulter, annuler
- ✅ Interface ADMIN — stats globales, valider/refuser, gérer les voitures
- ✅ Graphiques en temps réel (Recharts)
- ✅ Mode sombre / clair
- ✅ Responsive design
- ✅ Connexion complète au backend NestJS
- ✅ Dockerisation avec Nginx
- ✅ Pipeline CI/CD GitHub Actions
- ✅ Déployé sur Vercel

---

## 🐳 Docker

```bash
docker build -t drivenow-frontend .
docker run -p 80:80 drivenow-frontend
```

---

## 🔗 Liens

- Backend : [drivenow-backend](https://github.com/babsjunior2004-ctrl/drivenow-backend)
- Swagger API : `http://localhost:3000/api/docs`