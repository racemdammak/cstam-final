# TODO: Add Nutritional Characteristics and Google Fit Integration to Profile

## Tasks
- [x] Update Profile.tsx to include nutritional metrics (sugar, carbs, protein, fat) in dailyGoals with targets
- [x] Add new progress cards for nutritional metrics in Profile.tsx UI
- [x] Create googleFitService.ts to integrate Google Fit API for fetching health data (steps, sleep, heart rate, calories burned, distance, active minutes, etc.)
- [x] Update Profile.tsx to fetch and display Google Fit data, setting goals for each metric
- [x] Update README.md with Google Fit API setup instructions (API key, OAuth, etc.)
- [x] Test the integration and ensure data is saved to Firebase correctly
- [x] Fix Google Fit authentication issues and provide comprehensive troubleshooting
- [x] Implement daily wellness scoring system (0-33 points) based on goal completion
- [x] Add score history tracking for last 30 days
- [x] Update Firebase data structure to include dailyScores and scoreHistory
- [x] Add daily wellness score display in Profile UI with category breakdown
- [x] Implement automatic Firebase user data creation on first login
