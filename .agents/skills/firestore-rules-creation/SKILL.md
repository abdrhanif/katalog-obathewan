---
name: firestore-rules-creation
description: >-
  Creates and optimizes Cloud Firestore Security Rules following security best practices. Use when defining access control for Firestore collections (e.g. drug catalogs, user prescriptions, custom terminology).
metadata:
  author: Google LLC
  category: Database
  version: "1.0.0"
---

# Firestore Rules Creation

This skill provides security rules patterns for Cloud Firestore in the veterinary application:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for drug catalog & standard terminology
    match /drugs/{drugId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /terminology/{termId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // User-specific prescriptions and custom saved settings
    match /users/{userId}/prescriptions/{rxId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
