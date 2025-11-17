import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Heart, Flame, Apple, TrendingUp, Sparkles, Share2, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import type { MealAnalysis } from "@/services/mealDetectionService";

const Results = () => {
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);

  useEffect(() => {
    // Load analysis results from session storage
    const storedAnalysis = sessionStorage.getItem("mealAnalysis");
    if (storedAnalysis) {
      setAnalysis(JSON.parse(storedAnalysis));
    }

    // Trigger confetti animation
    setTimeout(() => {
      setShowResults(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#1e40af", "#3b82f6", "#60a5fa"],
      });
    }, 500);
  }, []);

  // Default to mock data if no analysis available
  const nutritionData = analysis || {
    calories: 520,
    protein: 35,
    carbs: 45,
    fats: 18,
    totalCalories: 520,
    totalProtein: 35,
    totalCarbs: 45,
    totalFat: 18,
  };

  const macroPercentages = {
    protein: (nutritionData.totalProtein * 4 / nutritionData.totalCalories) * 100,
    carbs: (nutritionData.totalCarbs * 4 / nutritionData.totalCalories) * 100,
    fats: (nutritionData.totalFat * 9 / nutritionData.totalCalories) * 100,
  };

  return (
    <div className="min-h-screen gradient-warm pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8">
        {/* Header with Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: showResults ? 1 : 0, scale: showResults ? 1 : 0.9 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4 shadow-elevated">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Analysis Complete! 🎉</h1>
          <p className="text-muted-foreground">
            {analysis?.mealName || "Here's what we found about your meal"}
          </p>
        </motion.div>

        {/* Detected Food Items */}
        {analysis && analysis.items && analysis.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showResults ? 1 : 0, y: showResults ? 0 : 20 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-3xl p-6 shadow-elevated mb-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              Detected Foods
            </h2>
            <div className="space-y-3">
              {analysis.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-semibold">
                      {Math.round(item.confidence * 100)}%
                    </Badge>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.calories} kcal
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Nutrition Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showResults ? 1 : 0, y: showResults ? 0 : 20 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-3xl p-6 shadow-elevated mb-6"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            Nutritional Breakdown
          </h2>

          {/* Calories */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Total Calories</span>
              <span className="text-2xl font-bold text-primary">
                {nutritionData.totalCalories} kcal
              </span>
            </div>
          </div>

          {/* Macros */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-sm font-bold">{nutritionData.totalProtein}g</span>
              </div>
              <Progress value={macroPercentages.protein} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Carbs</span>
                <span className="text-sm font-bold">{nutritionData.totalCarbs}g</span>
              </div>
              <Progress value={macroPercentages.carbs} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Fats</span>
                <span className="text-sm font-bold">{nutritionData.totalFat}g</span>
              </div>
              <Progress value={macroPercentages.fats} className="h-2" />
            </div>
          </div>
        </motion.div>

        {/* AI Advice Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showResults ? 1 : 0, y: showResults ? 0 : 20 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-6 shadow-soft mb-6 border border-primary/20"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Apple className="w-6 h-6 text-primary" />
            AI Nutrition Advice
          </h2>
          <div className="space-y-3 text-foreground/90">
            {analysis?.suggestion ? (
              <p className="leading-relaxed">{analysis.suggestion}</p>
            ) : (
              <>
                <p className="leading-relaxed">
                  ✨ <strong>Great choice!</strong> Your meal has a solid protein content, 
                  which helps with muscle recovery and keeps you feeling full longer.
                </p>
                <p className="leading-relaxed">
                  💡 <strong>Tip:</strong> Consider adding more colorful vegetables 
                  to boost your vitamin and fiber intake for the day.
                </p>
                <p className="leading-relaxed">
                  🌿 <strong>Balance:</strong> This meal fits well within a balanced diet. 
                  Remember to stay hydrated throughout the day!
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showResults ? 1 : 0, y: showResults ? 0 : 20 }}
          transition={{ delay: 0.8 }}
          className="bg-card rounded-3xl p-6 shadow-soft mb-6 text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4">
            <Heart className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <h3 className="text-lg font-bold mb-2">You're doing amazing! 💪</h3>
          <p className="text-muted-foreground">
            Every healthy meal is a step toward your wellness goals. 
            Keep up the great work, and remember to enjoy the journey!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showResults ? 1 : 0, y: showResults ? 0 : 20 }}
          transition={{ delay: 1 }}
          className="flex gap-3"
        >
          <Link to="/upload" className="flex-1">
            <Button variant="hero" size="lg" className="w-full">
              <Sparkles className="w-5 h-5" />
              Analyze Another Meal
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            <Share2 className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
