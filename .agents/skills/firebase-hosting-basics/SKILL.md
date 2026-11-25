---
name: firebase-hosting-basics
description: >-
  Deploys and configures classic Firebase Hosting for static websites, single-page apps (SPAs), and microservices. Use when deploying static sites/SPAs, setting up custom domains, configuring firebase.json hosting settings (redirects, rewrites, headers, multi-site), or managing preview channels. Don't use for Firebase App Hosting (Next.js/SSR), Auth, Firestore queries/rules, Data Connect, or Crashlytics.
metadata:
  author: Google LLC
  category: Serverless
  version: "1.0.0"
---

# Firebase Hosting Basics

This skill provides instructions and references for working with Firebase Hosting for deploying web applications.

## Standard Deployment Command

To deploy hosting content and configuration to your live site:

```bash
npx -y firebase-tools@latest deploy --only hosting --project katalog-obathewan
```

This deploys to your default hosting sites:
- `https://katalog-obathewan.web.app`
- `https://katalog-obathewan.firebaseapp.com`

## Preview Channels (Optional)

Deploy changes to a temporary preview URL before updating production:

```bash
npx -y firebase-tools@latest hosting:channel:deploy <channel-name> --project katalog-obathewan
```
