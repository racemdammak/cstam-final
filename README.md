# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4f5033fa-7551-4c18-a2a8-9f9585c53877

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4f5033fa-7551-4c18-a2a8-9f9585c53877) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4f5033fa-7551-4c18-a2a8-9f9585c53877) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Google Fit Integration

This application integrates with Google Fit to automatically sync health and fitness data from your smartwatch and other connected devices.

### How to Access Your Google Fit Data

**Step-by-Step Guide:**

1. **Set up Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable "Fitness API" in APIs & Services > Library

2. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized origins: `http://localhost:5173` (for development)
   - Add authorized redirect URIs: `http://localhost:5173` (for development)

3. **Configure OAuth Consent Screen**:
   - Go to "OAuth consent screen"
   - Choose "External" user type
   - Fill in app name, user support email, developer contact info
   - Add scopes: `https://www.googleapis.com/auth/fitness.activity.read`, `https://www.googleapis.com/auth/fitness.body.read`, `https://www.googleapis.com/auth/fitness.heart_rate.read`, `https://www.googleapis.com/auth/fitness.sleep.read`, `https://www.googleapis.com/auth/fitness.location.read`
   - **CRITICAL**: Add your Google account email as a test user

4. **Create Environment File**:
   ```bash
   # Create .env file in your project root
   echo "VITE_GOOGLE_FIT_CLIENT_ID=your_actual_client_id_here" > .env
   ```

5. **Run the Application**:
   ```bash
   npm run dev
   ```

6. **Connect Google Fit**:
   - Sign in to your app
   - Go to Profile page
   - Click "Connect Google Fit" button
   - Grant permissions for fitness data access
   - Your Google Fit data will automatically sync

**What Data Gets Synced:**
- **Steps**: Daily step count from your phone/watch
- **Sleep**: Hours slept (from sleep tracking)
- **Heart Rate**: Average resting heart rate
- **Calories Burned**: Total calories expended
- **Distance**: Kilometers walked/ran
- **Active Minutes**: Time spent in physical activity

**Troubleshooting:**
- **Make sure you're added as a test user** in OAuth consent screen
- **Verify the Fitness API is enabled**
- **Check that your `.env` file has the correct client ID**
- **Ensure you're using the same Google account that has Fit data**
- **If you get "access_denied"**: Add your email to test users in OAuth consent screen

### Firebase Data Structure

The user data is stored in Firestore with the following structure:

```
users/{userId}
├── name: string
├── email: string
├── avatar: string
├── wellnessScore: number (0-33, calculated from daily scores)
├── streak: number
├── lastReset: number (timestamp)
├── lastFitSync: timestamp (optional)
├── dailyScores: {
    ├── calories: number (0-3)
    ├── water: number (0-3)
    ├── steps: number (0-3)
    ├── sleep: number (0-3)
    ├── sugar: number (0-3)
    ├── carbs: number (0-3)
    ├── protein: number (0-3)
    ├── fat: number (0-3)
    ├── heartRate: number (0-3)
    ├── distance: number (0-3)
    └── activeMinutes: number (0-3)
}
├── scoreHistory: Array<{
    ├── date: timestamp
    ├── totalScore: number
    └── individualScores: { ... }
}> (last 30 days)
└── dailyGoals: {
    ├── calories: { current: number, target: number }
    ├── water: { current: number, target: number }
    ├── steps: { current: number, target: number }
    ├── sleep: { current: number, target: number }
    ├── sugar: { current: number, target: number }
    ├── carbs: { current: number, target: number }
    ├── protein: { current: number, target: number }
    ├── fat: { current: number, target: number }
    ├── heartRate: { current: number, target: number }
    ├── distance: { current: number, target: number }
    └── activeMinutes: { current: number, target: number }
}
```

### Daily Scoring System

Each goal is scored based on completion percentage:
- **0-25%**: 0 points
- **26-50%**: 1 point
- **51-75%**: 2 points
- **76-100%**: 3 points

**Total possible score**: 33 points (11 goals × 3 points each)

**Score categories**:
- **Basic Goals** (4 goals): Calories, Water, Steps, Sleep
- **Nutrition** (4 goals): Sugar, Carbs, Protein, Fat
- **Fitness** (3 goals): Heart Rate, Distance, Active Minutes

### Data Types Synced

The application syncs the following data from Google Fit:

- **Steps**: Daily step count
- **Sleep**: Total sleep duration in hours
- **Heart Rate**: Average resting heart rate in BPM
- **Calories Burned**: Total calories expended
- **Distance**: Distance traveled in kilometers
- **Active Minutes**: Time spent in active activities

### Goals and Targets

Default daily goals are set as follows:
- Calories: 2000 kcal
- Water: 8 glasses
- Steps: 10,000
- Sleep: 8 hours
- Sugar: 50g
- Carbs: 250g
- Protein: 100g
- Fat: 70g
- Heart Rate: 70 BPM (target resting)
- Distance: 5 km
- Active Minutes: 30 minutes

### Troubleshooting

- **"Missing required parameter client_id"**: Make sure you have created a `.env` file in the root directory with `VITE_GOOGLE_FIT_CLIENT_ID=your_actual_client_id_here`
- **"The OAuth client was not found" or "invalid_client"**: This means your Client ID is incorrect or not properly configured. Double-check:
  - The Client ID in your `.env` file matches exactly what's shown in Google Cloud Console
  - The OAuth 2.0 Client ID is configured for "Web application" type
  - The authorized origins include your development URL (e.g., `http://localhost:8081`)
  - The Fitness API is enabled in your Google Cloud project
- **"cstam n'a pas terminé la procédure de validation de Google" or "access_denied"**: This means your app is in testing mode and not published. To fix this:
  - Go to Google Cloud Console → APIs & Services → OAuth consent screen
  - Change the app status from "Testing" to "In production"
  - Or add your email (kamelaymen793@gmail.com) as a test user in the "Test users" section
- **Client Secret**: For Google Identity Services (web applications), only the Client ID is needed. The Client Secret is not required and should not be used in frontend code.
- **Authentication Issues**: Ensure your OAuth credentials are correctly configured and the redirect URI matches your app's URL
- **Data Not Syncing**: Check that you have granted all required permissions in Google Fit
- **API Errors**: Verify that the Fitness API is enabled in your Google Cloud project
- **Environment Variables**: Make sure the `.env` file is in the root directory and the variable is prefixed with `VITE_`

### Automatic Database Creation

The application now **automatically creates user data** in Firebase when a user first signs in. No manual setup required!

**What gets created automatically:**
- User profile (name, email, avatar from Firebase Auth)
- All daily goals with default targets
- Daily scoring system initialized to 0
- Score history array (starts empty)
- Wellness score starts at 0 (builds up as goals are completed)

### Manual Data Creation (Optional)

If you want to add sample data manually or modify existing data:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: cstam-f4349
3. **Navigate to Firestore Database**
4. **Create a document** in the `users` collection with your user ID as the document ID
5. **Add the following sample data**:

```json
{
  "name": "Your Name",
  "email": "your.email@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "wellnessScore": 24,
  "streak": 12,
  "lastReset": 1703126400000,
  "dailyScores": {
    "calories": 2,
    "water": 3,
    "steps": 2,
    "sleep": 3,
    "sugar": 1,
    "carbs": 2,
    "protein": 2,
    "fat": 2,
    "heartRate": 3,
    "distance": 2,
    "activeMinutes": 2
  },
  "scoreHistory": [],
  "dailyGoals": {
    "calories": { "current": 1200, "target": 2000 },
    "water": { "current": 5, "target": 8 },
    "steps": { "current": 8500, "target": 10000 },
    "sleep": { "current": 7.5, "target": 8 },
    "sugar": { "current": 25, "target": 50 },
    "carbs": { "current": 180, "target": 250 },
    "protein": { "current": 75, "target": 100 },
    "fat": { "current": 45, "target": 70 },
    "heartRate": { "current": 68, "target": 70 },
    "distance": { "current": 3.2, "target": 5 },
    "activeMinutes": { "current": 25, "target": 30 }
  }
}
```

**Note**: Replace the document ID with your actual Firebase Auth user ID. You can find this in the Firebase Authentication section of the console.

### Security Notes

- The application only requests read access to your fitness data
- Data is stored securely in Firebase and is only accessible to you
- Google Fit integration uses OAuth 2.0 for secure authentication
