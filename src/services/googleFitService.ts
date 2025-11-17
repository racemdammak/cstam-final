import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

// Google Fit API configuration
const GOOGLE_FIT_CLIENT_ID = import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID || "";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.location.read",
];

interface GoogleFitData {
  steps: number;
  sleep: number; // hours
  heartRate: number; // average bpm
  caloriesBurned: number;
  distance: number; // km
  activeMinutes: number;
}

class GoogleFitService {
  private accessToken: string | null = null;

  async authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if client ID is configured
      if (!GOOGLE_FIT_CLIENT_ID) {
        reject(new Error("Google Fit Client ID not configured. Please add VITE_GOOGLE_FIT_CLIENT_ID to your .env file."));
        return;
      }

      // Wait for Google Identity Services to load
      const checkGoogleLoaded = () => {
        if ((window as any).google?.accounts?.oauth2) {
          try {
            const client = (window as any).google.accounts.oauth2.initTokenClient({
              client_id: GOOGLE_FIT_CLIENT_ID,
              scope: SCOPES.join(" "),
              callback: (response: any) => {
                if (response.access_token) {
                  this.accessToken = response.access_token;
                  resolve();
                } else {
                  reject(new Error("Failed to get access token"));
                }
              },
            });

            client.requestAccessToken();
          } catch (error) {
            reject(new Error(`Google OAuth initialization failed: ${error.message}`));
          }
        } else {
          // Retry after a short delay if Google script hasn't loaded yet
          setTimeout(checkGoogleLoaded, 100);
        }
      };

      checkGoogleLoaded();
    });
  }

  async fetchTodayData(): Promise<GoogleFitData> {
    if (!this.accessToken) {
      throw new Error("Not authenticated with Google Fit");
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const startTimeMillis = startOfDay.getTime();
    const endTimeMillis = endOfDay.getTime();

    try {
      const [stepsData, sleepData, heartRateData, caloriesData, distanceData, activeMinutesData] = await Promise.all([
        this.fetchData("com.google.step_count.delta", startTimeMillis, endTimeMillis),
        this.fetchData("com.google.sleep.segment", startTimeMillis, endTimeMillis),
        this.fetchData("com.google.heart_rate.bpm", startTimeMillis, endTimeMillis),
        this.fetchData("com.google.calories.expended", startTimeMillis, endTimeMillis),
        this.fetchData("com.google.distance.delta", startTimeMillis, endTimeMillis),
        this.fetchData("com.google.active_minutes", startTimeMillis, endTimeMillis),
      ]);

      return {
        steps: this.aggregateSteps(stepsData),
        sleep: this.aggregateSleep(sleepData),
        heartRate: this.aggregateHeartRate(heartRateData),
        caloriesBurned: this.aggregateCalories(caloriesData),
        distance: this.aggregateDistance(distanceData),
        activeMinutes: this.aggregateActiveMinutes(activeMinutesData),
      };
    } catch (error) {
      console.error("Error fetching Google Fit data:", error);
      throw error;
    }
  }

  private async fetchData(dataTypeName: string, startTimeMillis: number, endTimeMillis: number): Promise<any[]> {
    const response = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataTypeName}/datasets/${startTimeMillis}-${endTimeMillis}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${dataTypeName} data`);
    }

    const data = await response.json();
    return data.point || [];
  }

  private aggregateSteps(points: any[]): number {
    return points.reduce((total, point) => {
      return total + (point.value?.[0]?.intVal || 0);
    }, 0);
  }

  private aggregateSleep(points: any[]): number {
    let totalSleepMinutes = 0;
    points.forEach(point => {
      if (point.value?.[0]?.intVal) {
        totalSleepMinutes += point.value[0].intVal;
      }
    });
    return totalSleepMinutes / 60; // Convert to hours
  }

  private aggregateHeartRate(points: any[]): number {
    const heartRates = points
      .map(point => point.value?.[0]?.fpVal)
      .filter(val => val != null);

    if (heartRates.length === 0) return 0;
    return heartRates.reduce((sum, rate) => sum + rate, 0) / heartRates.length;
  }

  private aggregateCalories(points: any[]): number {
    return points.reduce((total, point) => {
      return total + (point.value?.[0]?.fpVal || 0);
    }, 0);
  }

  private aggregateDistance(points: any[]): number {
    const totalMeters = points.reduce((total, point) => {
      return total + (point.value?.[0]?.fpVal || 0);
    }, 0);
    return totalMeters / 1000; // Convert to km
  }

  private aggregateActiveMinutes(points: any[]): number {
    return points.reduce((total, point) => {
      return total + (point.value?.[0]?.intVal || 0);
    }, 0);
  }

  async updateUserData(userId: string, fitData: GoogleFitData): Promise<void> {
    const userDocRef = doc(db, "users", userId);

    try {
      // Get current user data to calculate scores
      const userDoc = await getDoc(userDocRef);
      const currentData = userDoc.exists() ? userDoc.data() : {};

      // Update goals with Google Fit data
      const updatedGoals = {
        ...currentData.dailyGoals,
        steps: { ...currentData.dailyGoals?.steps, current: fitData.steps },
        sleep: { ...currentData.dailyGoals?.sleep, current: fitData.sleep },
        heartRate: { ...currentData.dailyGoals?.heartRate, current: fitData.heartRate },
        distance: { ...currentData.dailyGoals?.distance, current: fitData.distance },
        activeMinutes: { ...currentData.dailyGoals?.activeMinutes, current: fitData.activeMinutes },
        calories: { ...currentData.dailyGoals?.calories, current: fitData.caloriesBurned },
      };

      // Calculate new scores
      const scores = this.calculateDailyScores(updatedGoals);
      const totalScore = Object.values(scores).reduce((sum: number, score: number) => sum + score, 0);

      await updateDoc(userDocRef, {
        "dailyGoals.steps.current": fitData.steps,
        "dailyGoals.sleep.current": fitData.sleep,
        "dailyGoals.heartRate.current": fitData.heartRate,
        "dailyGoals.distance.current": fitData.distance,
        "dailyGoals.activeMinutes.current": fitData.activeMinutes,
        "dailyGoals.calories.current": fitData.caloriesBurned,
        dailyScores: scores,
        wellnessScore: totalScore,
        lastFitSync: new Date(),
      });
    } catch (error) {
      console.error("Error updating user data with Google Fit:", error);
      throw error;
    }
  }

  private calculateDailyScores(goals: any) {
    const scores: any = {};

    if (!goals) return scores;

    Object.keys(goals).forEach(key => {
      const goal = goals[key];
      if (goal && goal.current !== undefined && goal.target !== undefined) {
        const percentage = Math.min((goal.current / goal.target) * 100, 100);

        if (percentage >= 76) {
          scores[key] = 3;
        } else if (percentage >= 51) {
          scores[key] = 2;
        } else if (percentage >= 26) {
          scores[key] = 1;
        } else {
          scores[key] = 0;
        }
      } else {
        scores[key] = 0;
      }
    });

    return scores;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}

export const googleFitService = new GoogleFitService();
