
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  User,
  Heart,
  Droplets,
  Moon,
  Flame,
  TrendingUp,
  Award,
  Calendar,
  Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { googleFitService } from "@/services/googleFitService";

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({
    name: "User",
    avatar: "",
    initials: "U",
    dailyGoals: {
      calories: { current: 0, target: 2000 },
      water: { current: 0, target: 8 },
      steps: { current: 0, target: 10000 },
      sleep: { current: 0, target: 8 },
      sugar: { current: 0, target: 50 },
      carbs: { current: 0, target: 250 },
      protein: { current: 0, target: 100 },
      fat: { current: 0, target: 70 },
      heartRate: { current: 0, target: 70 }, // average resting heart rate
      distance: { current: 0, target: 5 }, // km
      activeMinutes: { current: 0, target: 30 },
    },
    wellnessScore: 85,
    dailyScores: {
      calories: 0,
      water: 0,
      steps: 0,
      sleep: 0,
      sugar: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      heartRate: 0,
      distance: 0,
      activeMinutes: 0,
    },
    scoreHistory: [], // Array of {date: timestamp, totalScore: number, individualScores: {...}}
    streak: 12,
    lastReset: Date.now(),
  });

  const initialDailyGoals = {
    calories: { current: 0, target: 2000 },
    water: { current: 0, target: 8 },
    steps: { current: 0, target: 10000 },
    sleep: { current: 0, target: 8 },
    sugar: { current: 0, target: 50 },
    carbs: { current: 0, target: 250 },
    protein: { current: 0, target: 100 },
    fat: { current: 0, target: 70 },
    heartRate: { current: 0, target: 70 },
    distance: { current: 0, target: 5 },
    activeMinutes: { current: 0, target: 30 },
  };

  const initialDailyScores = {
    calories: 0,
    water: 0,
    steps: 0,
    sleep: 0,
    sugar: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    heartRate: 0,
    distance: 0,
    activeMinutes: 0,
  };

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // Create initial user data automatically
            const initialUserData = {
              name: currentUser.displayName || "User",
              email: currentUser.email || "",
              avatar: currentUser.photoURL || "",
              wellnessScore: 0,
              dailyScores: initialDailyScores,
              scoreHistory: [],
              streak: 0,
              lastReset: Date.now(),
              dailyGoals: initialDailyGoals,
              createdAt: new Date(),
            };

            await setDoc(userDocRef, initialUserData);
            setUserData(prev => ({
              ...prev,
              name: initialUserData.name,
              avatar: initialUserData.avatar,
              initials: initialUserData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
              dailyGoals: initialUserData.dailyGoals,
              dailyScores: initialUserData.dailyScores,
              scoreHistory: initialUserData.scoreHistory,
              wellnessScore: initialUserData.wellnessScore,
              streak: initialUserData.streak,
              lastReset: initialUserData.lastReset,
            }));
            return;
          }

          const data = userDoc.data();
          const now = Date.now();
          const lastReset = data.lastReset || 0;
          const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

          // Check if 24 hours have passed since last reset
          if (now - lastReset >= oneDay) {
            // Calculate final daily scores before reset
            const finalScores = calculateDailyScores(data.dailyGoals || initialDailyGoals);
            const totalScore = Object.values(finalScores).reduce((sum, score) => sum + score, 0);

            // Save to score history
            const scoreHistory = data.scoreHistory || [];
            scoreHistory.push({
              date: lastReset,
              totalScore: totalScore,
              individualScores: finalScores,
            });

            // Reset daily goals and scores
            const updatedData = {
              ...data,
              dailyGoals: initialDailyGoals,
              dailyScores: initialDailyScores,
              scoreHistory: scoreHistory.slice(-30), // Keep last 30 days
              lastReset: now,
            };
            await setDoc(userDocRef, updatedData);
            setUserData(prev => ({
              ...prev,
              name: data.name || currentUser.displayName || "User",
              avatar: data.avatar || currentUser.photoURL || "",
              initials: (data.name || currentUser.displayName || "User").split(' ').map(n => n[0]).join('').toUpperCase(),
              dailyGoals: updatedData.dailyGoals,
              dailyScores: updatedData.dailyScores,
              scoreHistory: updatedData.scoreHistory,
              lastReset: updatedData.lastReset,
            }));
          } else {
            setUserData(prev => ({
              ...prev,
              name: data.name || currentUser.displayName || "User",
              avatar: data.avatar || currentUser.photoURL || "",
              initials: (data.name || currentUser.displayName || "User").split(' ').map(n => n[0]).join('').toUpperCase(),
              dailyGoals: data.dailyGoals || initialDailyGoals,
              dailyScores: data.dailyScores || initialDailyScores,
              scoreHistory: data.scoreHistory || [],
              lastReset: data.lastReset || now,
            }));
          }

          // Fetch Google Fit data if authenticated
          if (googleFitService.isAuthenticated()) {
            try {
              const fitData = await googleFitService.fetchTodayData();
              await googleFitService.updateUserData(currentUser.uid, fitData);

              // Update local state with Google Fit data
              setUserData(prev => ({
                ...prev,
                dailyGoals: {
                  ...prev.dailyGoals,
                  steps: { ...prev.dailyGoals.steps, current: fitData.steps },
                  sleep: { ...prev.dailyGoals.sleep, current: fitData.sleep },
                  heartRate: { ...prev.dailyGoals.heartRate, current: fitData.heartRate },
                  distance: { ...prev.dailyGoals.distance, current: fitData.distance },
                  activeMinutes: { ...prev.dailyGoals.activeMinutes, current: fitData.activeMinutes },
                  calories: { ...prev.dailyGoals.calories, current: fitData.caloriesBurned },
                },
              }));
            } catch (error) {
              console.error("Error fetching Google Fit data:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [currentUser]);

  // Calculate daily scores based on goal completion
  const calculateDailyScores = (goals: typeof initialDailyGoals) => {
    const scores: typeof initialDailyScores = { ...initialDailyScores };

    // Calculate percentage completion for each goal and assign points
    Object.keys(goals).forEach(key => {
      const goal = goals[key as keyof typeof goals];
      const percentage = Math.min((goal.current / goal.target) * 100, 100);

      // Scoring system: 0-25% = 0 points, 26-50% = 1 point, 51-75% = 2 points, 76-100% = 3 points
      if (percentage >= 76) {
        scores[key as keyof typeof scores] = 3;
      } else if (percentage >= 51) {
        scores[key as keyof typeof scores] = 2;
      } else if (percentage >= 26) {
        scores[key as keyof typeof scores] = 1;
      } else {
        scores[key as keyof typeof scores] = 0;
      }
    });

    return scores;
  };

  // Update scores when goals change
  useEffect(() => {
    const newScores = calculateDailyScores(userData.dailyGoals);
    const totalScore = Object.values(newScores).reduce((sum, score) => sum + score, 0);

    setUserData(prev => ({
      ...prev,
      dailyScores: newScores,
      wellnessScore: totalScore,
    }));
  }, [userData.dailyGoals]);

  const goalCards = [
    {
      icon: Flame,
      label: "Calories",
      current: userData.dailyGoals.calories.current,
      target: userData.dailyGoals.calories.target,
      unit: "kcal",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Droplets,
      label: "Water",
      current: userData.dailyGoals.water.current,
      target: userData.dailyGoals.water.target,
      unit: "glasses",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: TrendingUp,
      label: "Steps",
      current: userData.dailyGoals.steps.current,
      target: userData.dailyGoals.steps.target,
      unit: "steps",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Moon,
      label: "Sleep",
      current: userData.dailyGoals.sleep.current,
      target: userData.dailyGoals.sleep.target,
      unit: "hours",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: Flame,
      label: "Sugar",
      current: userData.dailyGoals.sugar.current,
      target: userData.dailyGoals.sugar.target,
      unit: "g",
      color: "text-red-600",
      bgColor: "bg-red-600/10",
    },
    {
      icon: TrendingUp,
      label: "Carbs",
      current: userData.dailyGoals.carbs.current,
      target: userData.dailyGoals.carbs.target,
      unit: "g",
      color: "text-yellow-600",
      bgColor: "bg-yellow-600/10",
    },
    {
      icon: Award,
      label: "Protein",
      current: userData.dailyGoals.protein.current,
      target: userData.dailyGoals.protein.target,
      unit: "g",
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
    {
      icon: Heart,
      label: "Fat",
      current: userData.dailyGoals.fat.current,
      target: userData.dailyGoals.fat.target,
      unit: "g",
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
    },
    {
      icon: Heart,
      label: "Heart Rate",
      current: userData.dailyGoals.heartRate.current,
      target: userData.dailyGoals.heartRate.target,
      unit: "bpm",
      color: "text-pink-600",
      bgColor: "bg-pink-600/10",
    },
    {
      icon: TrendingUp,
      label: "Distance",
      current: userData.dailyGoals.distance.current,
      target: userData.dailyGoals.distance.target,
      unit: "km",
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
    {
      icon: Calendar,
      label: "Active Minutes",
      current: userData.dailyGoals.activeMinutes.current,
      target: userData.dailyGoals.activeMinutes.target,
      unit: "min",
      color: "text-orange-600",
      bgColor: "bg-orange-600/10",
    },
  ];

  return (
    <div className="min-h-screen gradient-warm pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold">Profile</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await googleFitService.authenticate();
                  // Refresh data after authentication
                  window.location.reload();
                } catch (error) {
                  console.error("Google Fit authentication failed:", error);
                }
              }}
            >
              Connect Google Fit
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-6 shadow-elevated mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              <AvatarImage src={userData.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl font-bold">
                {userData.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Hey, {userData.name}! 👋</h2>
              <p className="text-muted-foreground">Keep up the amazing work!</p>
            </div>
          </div>

          {/* Wellness Score */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Daily Wellness Score
              </span>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {userData.wellnessScore}
              </span>
            </div>
            <Progress value={userData.wellnessScore} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Excellent! You're in great shape today 💪
            </p>
          </div>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 shadow-elevated mb-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Current Streak</p>
              <p className="text-3xl font-bold flex items-center gap-2">
                <Award className="w-8 h-8" />
                {userData.streak} days
              </p>
            </div>
            <div className="text-6xl">🔥</div>
          </div>
          <p className="text-white/90 text-sm mt-3">
            Amazing dedication! Keep logging your meals daily!
          </p>
        </motion.div>

        {/* Daily Wellness Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Daily Wellness Score
              </h3>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{userData.wellnessScore}</div>
                <div className="text-sm text-muted-foreground">out of 33 points</div>
              </div>
            </div>
            <Progress value={(userData.wellnessScore / 33) * 100} className="h-2 mb-4" />
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold">{userData.dailyScores.calories + userData.dailyScores.water + userData.dailyScores.steps + userData.dailyScores.sleep}</div>
                <div className="text-muted-foreground">Basic Goals</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{userData.dailyScores.sugar + userData.dailyScores.carbs + userData.dailyScores.protein + userData.dailyScores.fat}</div>
                <div className="text-muted-foreground">Nutrition</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{userData.dailyScores.heartRate + userData.dailyScores.distance + userData.dailyScores.activeMinutes}</div>
                <div className="text-muted-foreground">Fitness</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Today's Progress
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {goalCards.slice(0, 4).map((goal, index) => {
              const Icon = goal.icon;
              const percentage = (goal.current / goal.target) * 100;

              return (
                <motion.div
                  key={goal.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 transition-smooth hover:shadow-elevated"
                >
                  <div className={`w-10 h-10 rounded-xl ${goal.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${goal.color}`} />
                  </div>
                  <h4 className="font-semibold mb-2">{goal.label}</h4>
                  <div className="mb-2">
                    <span className="text-2xl font-bold">{goal.current}</span>
                    <span className="text-sm text-muted-foreground">/{goal.target}</span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </motion.div>
              );
            })}
          </div>

          {/* Additional Goals */}
          <h3 className="text-xl font-bold mb-4 mt-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Nutrition & Fitness Goals
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {goalCards.slice(4).map((goal, index) => {
              const Icon = goal.icon;
              const percentage = (goal.current / goal.target) * 100;

              return (
                <motion.div
                  key={goal.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 transition-smooth hover:shadow-elevated"
                >
                  <div className={`w-10 h-10 rounded-xl ${goal.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${goal.color}`} />
                  </div>
                  <h4 className="font-semibold mb-2">{goal.label}</h4>
                  <div className="mb-2">
                    <span className="text-2xl font-bold">{goal.current}</span>
                    <span className="text-sm text-muted-foreground">/{goal.target}</span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Encouraging Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-accent/50 rounded-2xl p-5 border border-border/50 text-center"
        >
          <p className="text-muted-foreground">
            💖 Remember: Progress over perfection. Every small step counts toward your wellness journey!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
