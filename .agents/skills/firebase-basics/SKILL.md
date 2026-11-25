---
name: firebase-basics
description: >-
  Provides foundational Firebase CLI setup, CLI installation, version checks (`firebase-tools@latest --version`), CLI login (including --no-localhost), project creation, project selection (`firebase use`), and app config file downloads (`google-services.json`, `GoogleService-Info.plist`). Use ONLY for CLI login, project creation/switching, or downloading app config files. Don't use for Firebase Hosting deploy, Firestore, Auth, App Hosting, Data Connect, Crashlytics, or Remote Config.
metadata:
  author: Google LLC
  category: CloudInfrastructureAndServices
  version: "1.0.0"
---

# Firebase Basics

This skill documents the foundational setup required for managing Firebase projects and CLI operations.

## CLI Commands

### 1. Version Check & Installation
Verify that the Firebase CLI is installed and up-to-date:
```bash
npx -y firebase-tools@latest --version
```

### 2. Authentication
Log in to your Firebase account:
```bash
# In interactive environments:
npx -y firebase-tools@latest login

# In remote or headless environments:
npx -y firebase-tools@latest login --no-localhost
```

### 3. Select Active Project
Select or switch to the project context:
```bash
npx -y firebase-tools@latest use katalog-obathewan
```

### 4. Register Web App
Register a web app in the active Firebase project:
```bash
npx -y firebase-tools@latest apps:create WEB "Katalog Obat Hewan" --project katalog-obathewan
```

### 5. Fetch Web App Configuration
Retrieve the Firebase configuration snippet:
```bash
npx -y firebase-tools@latest apps:sdkconfig WEB --project katalog-obathewan
```
