import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createUserProfile } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Step 1
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    
    // Step 2
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    
    // Step 3
    goal: "",
    
    // Step 4
    dietPlan: "",
    customCarbs: "",
    customProtein: "",
    customFat: "",
  });

  const dietPlans = [
    {
      id: "balanced",
      name: "Balanced",
      description: "40% carbs, 30% protein, 30% fat",
      icon: "⚖️",
    },
    {
      id: "high-protein",
      name: "High Protein",
      description: "35% carbs, 40% protein, 25% fat",
      icon: "💪",
    },
    {
      id: "low-carb",
      name: "Low Carb",
      description: "25% carbs, 35% protein, 40% fat",
      icon: "🥑",
    },
    {
      id: "custom",
      name: "Custom",
      description: "Set your own macros",
      icon: "⚙️",
    },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create auth account
      const userCredential = await signup(formData.email, formData.password);
      const userId = userCredential.user.uid;

      // Prepare user profile data, filtering out undefined values
      const userProfileData: any = {
        email: formData.email,
        name: formData.name,
      };

      if (formData.age) userProfileData.age = parseInt(formData.age);
      if (formData.gender) userProfileData.gender = formData.gender;
      if (formData.height) userProfileData.height = parseFloat(formData.height);
      if (formData.weight) userProfileData.weight = parseFloat(formData.weight);
      if (formData.activityLevel) userProfileData.activityLevel = formData.activityLevel;
      if (formData.goal) userProfileData.goal = formData.goal;
      if (formData.dietPlan) userProfileData.dietPlan = formData.dietPlan;
      if (formData.customCarbs) userProfileData.customCarbs = parseInt(formData.customCarbs);
      if (formData.customProtein) userProfileData.customProtein = parseInt(formData.customProtein);
      if (formData.customFat) userProfileData.customFat = parseInt(formData.customFat);

      // Create user profile in Firestore
      await createUserProfile(userId, userProfileData);

      toast({
        title: "Success!",
        description: "Account created successfully!",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen gradient-warm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Logo & Progress */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-elevated">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NutriSense AI
            </h1>
          </motion.div>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {[...Array(totalSteps)].map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-smooth ${
                  index + 1 <= step
                    ? "bg-primary w-8"
                    : "bg-border w-2"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Form Content */}
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-elevated border border-border/50">
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
                  <p className="text-muted-foreground">
                    Let's start your wellness journey! 🌿
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Body Metrics */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Tell Us About Yourself</h2>
                  <p className="text-muted-foreground">
                    Help us personalize your nutrition plan 📏
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={formData.height}
                      onChange={(e) => updateField("height", e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => updateField("weight", e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityLevel">Activity Level</Label>
                  <Select value={formData.activityLevel} onValueChange={(value) => updateField("activityLevel", value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                      <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                      <SelectItem value="very-active">Very Active (hard exercise daily)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {/* Step 3: Goals */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">What's Your Goal?</h2>
                  <p className="text-muted-foreground">
                    Choose what you want to achieve 🎯
                  </p>
                </div>

                <RadioGroup value={formData.goal} onValueChange={(value) => updateField("goal", value)}>
                  <div className="grid gap-4">
                    {[
                      { value: "lose", label: "Lose Weight", emoji: "🔥", desc: "Burn fat and lean up" },
                      { value: "maintain", label: "Maintain Weight", emoji: "⚖️", desc: "Keep current weight" },
                      { value: "gain", label: "Gain Weight", emoji: "💪", desc: "Build muscle mass" },
                    ].map((goal) => (
                      <motion.label
                        key={goal.value}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center space-x-4 p-4 rounded-2xl border-2 cursor-pointer transition-smooth ${
                          formData.goal === goal.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={goal.value} id={goal.value} />
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-3xl">{goal.emoji}</span>
                          <div>
                            <div className="font-semibold">{goal.label}</div>
                            <div className="text-sm text-muted-foreground">{goal.desc}</div>
                          </div>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {/* Step 4: Diet Plan */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Choose Your Diet Plan</h2>
                  <p className="text-muted-foreground">
                    Select a plan or customize your macros 🥗
                  </p>
                </div>

                <div className="grid gap-4 mb-6">
                  {dietPlans.map((plan) => (
                    <motion.button
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => updateField("dietPlan", plan.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-smooth ${
                        formData.dietPlan === plan.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{plan.icon}</span>
                          <div>
                            <div className="font-semibold">{plan.name}</div>
                            <div className="text-sm text-muted-foreground">{plan.description}</div>
                          </div>
                        </div>
                        {formData.dietPlan === plan.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Custom Macro Inputs */}
                {formData.dietPlan === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 p-4 bg-accent/50 rounded-2xl border border-border"
                  >
                    <h3 className="font-semibold">Custom Macros (in percentages)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customCarbs">Carbs (%)</Label>
                        <Input
                          id="customCarbs"
                          type="number"
                          placeholder="40"
                          value={formData.customCarbs}
                          onChange={(e) => updateField("customCarbs", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customProtein">Protein (%)</Label>
                        <Input
                          id="customProtein"
                          type="number"
                          placeholder="30"
                          value={formData.customProtein}
                          onChange={(e) => updateField("customProtein", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customFat">Fat (%)</Label>
                        <Input
                          id="customFat"
                          type="number"
                          placeholder="30"
                          value={formData.customFat}
                          onChange={(e) => updateField("customFat", e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2 p-4 bg-accent/30 rounded-2xl">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="text-sm cursor-pointer">
                    I agree to the Terms of Service and Privacy Policy. I understand that this app is
                    for informational purposes only and does not replace professional medical advice.
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                variant="hero"
                onClick={handleNext}
                className="gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="hero"
                onClick={handleSubmit}
                className="gap-2"
                disabled={loading}
              >
                <Heart className="w-4 h-4" />
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            )}
          </div>
        </div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
