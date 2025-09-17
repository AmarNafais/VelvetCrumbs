# 🚀 Firebase Deployment Instructions for Velvet Crumbs

## Prerequisites ✅
- [x] Firebase project created: `velvet-crumbs-47af6`
- [x] Firebase SDK installed
- [x] API key configured securely
- [x] Build configuration ready

## Deployment Steps

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Verify Project Configuration
```bash
firebase projects:list
firebase use velvet-crumbs-47af6
```

### 4. Install Functions Dependencies
```bash
cd functions
npm install firebase-functions firebase-admin
cd ..
```

### 5. Deploy to Firebase
```bash
# Deploy everything
firebase deploy

# Or deploy separately:
firebase deploy --only hosting    # Frontend only
firebase deploy --only functions  # Backend API only
```

## Important Notes 📋

### Required Firebase Plan
- **Blaze Plan** (pay-as-you-go) required for Cloud Functions
- Free tier available for hosting only

### Environment Variables for Production
You'll need to set these in Firebase Functions:
```bash
firebase functions:config:set \
  database.url="your-external-postgres-url" \
  session.secret="your-session-secret"
```

### Database Setup
- Current setup uses local PostgreSQL
- For production, you'll need external PostgreSQL (Neon, Supabase, Railway)
- Update connection string in Firebase Functions config

## Next Steps 🎯
1. Set up external PostgreSQL database
2. Configure production environment variables
3. Deploy to Firebase
4. Test live application

Your app will be available at: `https://velvet-crumbs-47af6.firebaseapp.com`