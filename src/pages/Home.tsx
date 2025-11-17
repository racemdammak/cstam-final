import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Heart, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-nutrition.jpg";

const Home = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const motivationalQuotes = [
    "Every healthy choice is a step toward a better you 💖",
    "Your body is your home, let's make it the best place to live 🌿",
    "Progress, not perfection. You've got this! 💪",
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="min-h-screen gradient-warm pb-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container max-w-4xl mx-auto px-4 pt-12"
      >
        {/* User Info & Logout */}
        {currentUser && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back!</p>
              <p className="font-semibold">{currentUser.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}

        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-elevated">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              NutriSense AI
            </h1>
          </motion.div>
          <p className="text-lg text-foreground/80 font-medium">
            Your personal nutrition companion
          </p>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden shadow-elevated mb-8 aspect-video"
        >
          <img
            src={heroImage}
            alt="Fresh healthy fruits and vegetables"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </motion.div>

        {/* Motivational Quote Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-primary/5 border-2 border-primary/20 rounded-3xl p-6 shadow-soft mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2 text-lg">Today's Inspiration</h3>
              <p className="text-foreground/90 text-base leading-relaxed">{randomQuote}</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-4"
        >
          <Link to="/upload">
            <Button variant="hero" size="lg" className="w-full group">
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Analyze My Meal 🍽️
            </Button>
          </Link>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-card border-2 border-border rounded-2xl p-6 shadow-soft transition-smooth hover:shadow-elevated hover:border-primary/30"
            >
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold mb-2 text-base">AI-Powered</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Smart meal analysis
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-card border-2 border-border rounded-2xl p-6 shadow-soft transition-smooth hover:shadow-elevated hover:border-secondary/30"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold mb-2 text-base">Track Progress</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Watch yourself grow
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Made with 💖 for healthy living
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Home;
