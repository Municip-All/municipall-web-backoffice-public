# Municip'All — Backoffice Mairie

Portail web de **gestion citoyenne et administrative** pour les équipes municipales. Permet aux agents et élus de modérer les signalements, gérer les services de la commune, communiquer avec les citoyens et piloter l'activité locale.

## Vue d'ensemble

| Élément | Détail |
|---------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Cartes / graphiques | Leaflet, Recharts |
| Audience | Agents et élus de la mairie |
| Auth | JWT + permissions backend |
| Scope | Une commune (tenant) |

## Rôle dans l'écosystème

Ce projet est le **panel opérationnel** utilisé au quotidien par chaque commune. Il se distingue du [Web Admin](../municipall-webadmin-public) qui gère la plateforme dans son ensemble.

| | Backoffice Mairie | Web Admin |
|--|-------------------|-----------|
| Utilisateurs | Staff municipal | Équipe Municip'All |
| Périmètre | Une commune | Toutes les communes |
| Auth | JWT email/mot de passe | Code d'accès + clé plateforme |
| Focus | Signalements, services, communication | Infra, onboarding, DB |

## Architecture de navigation

L'application est principalement une **SPA** sur `/` : les vues changent côté client sans modification d'URL.

### Routes publiques

| Route | Description |
|-------|-------------|
| `/` | Panel authentifié (toutes les vues) |
| `/legal/[doc]` | Documents légaux (`cgu`, `privacy`, `cookies`, etc.) |
| `/invite/[token]` | Acceptation d'invitation équipe |

### Vues internes (sidebar)

**Pilotage**
- `team-insights` — KPIs équipe
- `citizen-feedback` — Retours citoyens
- `team-manage` — Gestion de l'équipe
- `pouls-ai` — Dashboard principal

**Supervision**
- `moderation` — File de signalements citoyens

**Communication**
- `targeted-push` — Notifications ciblées

**Services ville**
- `widgets`, `transport`, `neighborhoods`
- `events`, `construction`, `waste`
- `associations`, `city-profile`

**Paramètres**
- `profile` — Profil agent
- `settings` — Marque blanche, configuration commune

## Fonctionnalités

- **Modération** — Queue unifiée des signalements, changement de statut, chat citoyen
- **Contact** — Tickets de suggestion avec fil de discussion
- **Notifications** — Alertes push ciblées aux citoyens
- **Événements** — CRUD agenda municipal
- **Travaux** — Gestion des chantiers
- **Collecte** — Planning des déchets
- **Associations** — Groupes et associations locales
- **Transport** — Configuration IDFM et perturbations
- **Quartiers** — Gestion des zones
- **Profil public** — Page publique de la commune
- **Marque blanche** — Couleurs, logo, blason
- **Équipe** — Invitations, rôles (maire, agent)
- **Cartographie** — Carte des signalements et localisation

## Structure du projet

```
app/
├── layout.tsx
├── page.tsx              # Shell SPA principal
├── legal/[doc]/page.tsx
└── invite/[token]/page.tsx

components/               # ~35 modules métier
├── ModerationMatrix.tsx
├── ReportDetailModal.tsx
├── EventManager.tsx
├── ConstructionManager.tsx
├── WhiteLabelSettings.tsx
├── TeamManager.tsx
└── ...

context/
├── AuthContext.tsx       # JWT, session
├── PermissionsContext.tsx
├── InboxContext.tsx      # Compteurs signalements
└── ThemeContext.tsx

hooks/
└── useLiveChatRefresh.ts

lib/
├── api.ts                # Client HTTP (Bearer + x-tenant-id)
├── permissions.ts
└── legal.ts
```

## Prérequis

- Node.js 18+
- npm
- Backend Municip'All en cours d'exécution
- Compte agent ou maire créé sur la commune

## Installation

```bash
npm install
```

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

En production : `https://api.municipall.dev` ou `https://dev.api.municipall.dev`.

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | URL de base de l'API backend | `http://localhost:3000` |

L'authentification utilise un JWT stocké en `localStorage`. Le tenant (`x-tenant-id`) est dérivé de la session utilisateur.

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (http://localhost:3000) |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run lint` | ESLint |

## Authentification

1. Connexion via `/auth/backoffice/login` (email + mot de passe)
2. JWT stocké en `localStorage`
3. Permissions chargées depuis le backend (`reports:read`, `city_config:write`, etc.)
4. En-tête `x-tenant-id` automatique sur chaque requête

### Invitations équipe

Les nouveaux agents reçoivent un lien `/invite/[token]` pour créer leur compte et rejoindre la commune.

## Déploiement Docker

```bash
docker compose -f docker-compose.dev.yml up -d   # dev (port 4001)
docker compose -f docker-compose.prod.yml up -d  # prod
```

Les workflows GitHub Actions déploient séparément dev et prod avec la bonne `NEXT_PUBLIC_API_URL`.

## Permissions

Les actions disponibles dépendent du rôle backend :

| Rôle | Accès typique |
|------|---------------|
| **Maire** | Pilotage, équipe, feedback, toutes les permissions |
| **Agent** | Modération, services ville selon permissions assignées |

## Écosystème Municip'All

| Projet | Rôle |
|--------|------|
| [municipall-backend-public](../municipall-backend-public) | API REST |
| [municipall-frontend-public](../municipall-frontend-public) | Site vitrine |
| [municipall-mobile-public](../municipall-mobile-public) | App mobile citoyenne |
| [municipall-webadmin-public](../municipall-webadmin-public) | Administration plateforme |

## Licence

Projet privé
