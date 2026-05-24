# TrustLayer — Guide de démarrage

## Installation en 5 étapes

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement
```bash
cp .env.local.example .env.local
# Remplir toutes les valeurs dans .env.local
```

### 3. Créer la base de données Supabase
- Aller sur supabase.com → votre projet → SQL Editor
- Copier-coller le contenu de database/schema.sql
- Cliquer Run

### 4. Tester en local
```bash
npm run dev
# Ouvrir http://localhost:3000
```

### 5. Déployer sur Vercel
- Pusher le code sur GitHub
- Connecter le repo à Vercel
- Ajouter les variables d'environnement dans Vercel → Settings → Environment Variables
- Déployer

## Variables d'environnement — où les trouver

| Variable | Où la trouver |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase → Settings → API → Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase → Settings → API → anon public |
| SUPABASE_SERVICE_ROLE_KEY | Supabase → Settings → API → service_role |
| TWILIO_ACCOUNT_SID | twilio.com → Console → Account Info |
| TWILIO_AUTH_TOKEN | twilio.com → Console → Account Info |
| TWILIO_PHONE_NUMBER | twilio.com → Phone Numbers |
| JWT_SECRET | Générer : openssl rand -base64 32 |
| NEXT_PUBLIC_APP_URL | URL de votre app Vercel |
