# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the NutriSense AI app.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Authentication

1. In the Firebase Console, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the following sign-in methods:
   - Email/Password
   - Google

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>`
5. Register your app with a nickname (e.g., "NutriSense AI")
6. Copy the Firebase configuration object

## Step 4: Update Firebase Config

1. Open `src/firebase/config.ts`
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## Step 5: Configure Firestore Database

1. In Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location for your database
5. Click "Enable"

## Step 6: Set Up Firestore Security Rules

Update your Firestore security rules to protect user data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Users can read/write their own nutrition data
      match /nutrition/{date} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

1. In Firebase Console, go to Firestore Database
2. Click on the "Rules" tab
3. Paste the rules above
4. Click "Publish"

## Step 7: Test Your Setup

1. Run your app: `npm run dev`
2. Navigate to `/signup`
3. Create a test account
4. Check Firebase Console → Authentication to see the new user
5. Check Firestore Database to see the user profile

## Firebase Data Structure

Your Firestore database will have the following structure:

```
users/
  {userId}/
    - name
    - email
    - age
    - gender
    - height
    - weight
    - activityLevel
    - goal
    - dietPlan
    - customCarbs
    - customProtein
    - customFat
    - createdAt
    - updatedAt
    
    nutrition/
      {date}/
        - date
        - calories
        - protein
        - carbs
        - fat
        - water
        - meals[]
        - timestamp
```

## Features Implemented

✅ Email/Password Authentication
✅ Google Sign-In
✅ User Profile Creation
✅ Protected User Data
✅ Per-User Nutrition Tracking
✅ Automatic Authentication State Management

## Next Steps

- Add password reset functionality
- Implement email verification
- Add social media authentication (Facebook, Twitter, etc.)
- Set up user profile photo upload
- Implement data export functionality

## Troubleshooting

**Common Issues:**

1. **Authentication errors**: Make sure Email/Password is enabled in Firebase Console
2. **Permission denied errors**: Check your Firestore security rules
3. **Config errors**: Verify your Firebase configuration values are correct

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
