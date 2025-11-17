import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/api";

const MealUpload = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mealDescription, setMealDescription] = useState<string>("");
  const [detectedItems, setDetectedItems] = useState<Array<{item: string, confidence: number}> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [foodData, setFoodData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        const response = await api.get('/food_data');
        setFoodData(JSON.parse(response.data.food_data));
      } catch (error) {
        console.error('Failed to fetch food data:', error);
      }
    };
    fetchFoodData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendImage = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const payload: any = { image: reader.result };
        if (mealDescription.trim()) {
          payload.description = mealDescription.trim();
        }
        const response = await api.post('/upload_image', payload);
        console.log(response);
        setDetectedItems(response.data.detected_items || []);
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      } catch (error) {
        console.error('Upload failed:', error);
        toast({
          title: "Error",
          description: "Failed to upload image.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };



  return (
    <div className="min-h-screen gradient-warm pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Upload Your Meal 🍽️</h1>
          <p className="text-muted-foreground">
            Upload a photo of what you ate
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-6 shadow-elevated mb-6"
        >
          {/* Image Upload Area */}
          <div className="mb-6">
            <label
              htmlFor="image-upload"
              className={`relative block w-full aspect-video rounded-2xl border-2 border-dashed transition-smooth cursor-pointer overflow-hidden ${
                imagePreview
                  ? "border-primary bg-primary/5"
                  : "border-border bg-accent hover:bg-accent/80 hover:border-primary"
              }`}
            >
              <AnimatePresence mode="wait">
                {imagePreview ? (
                  <motion.img
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    src={imagePreview}
                    alt="Meal preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center p-6"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-semibold mb-1">Upload meal photo</p>
                    <p className="text-sm text-muted-foreground">
                      Click to browse or drag and drop
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Meal Description */}
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <label htmlFor="meal-description" className="block text-sm font-medium mb-2">
                Describe your meal (optional)
              </label>
              <textarea
                id="meal-description"
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                placeholder="e.g., Grilled chicken salad with avocado and tomatoes..."
                className="w-full p-3 rounded-2xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
            </motion.div>
          )}

          {/* Send Button */}
          {imagePreview && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleSendImage}
              disabled={isAnalyzing}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? "Analyzing..." : "Send Image"}
            </motion.button>
          )}

          {/* Detected Items */}
          {detectedItems && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`mt-6 p-4 rounded-2xl border ${
                detectedItems.length > 0
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
              }`}
            >
              <div className="flex items-center mb-3">
                <CheckCircle className={`w-5 h-5 mr-2 ${
                  detectedItems.length > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`} />
                <h3 className={`font-semibold ${
                  detectedItems.length > 0
                    ? "text-green-800 dark:text-green-200"
                    : "text-yellow-800 dark:text-yellow-200"
                }`}>
                  {detectedItems.length > 0 ? "Detected Items" : "Analysis Complete"}
                </h3>
              </div>
              {detectedItems.length > 0 ? (
                <div className="space-y-4">
                  {detectedItems.map((item, index) => {
                    const dish = foodData?.tunisian_cuisine?.dishes?.find((d: any) => d.name.toLowerCase() === item.item.toLowerCase());
                    return (
                      <div key={index} className="border border-border rounded-lg p-3 bg-background/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{item.item}</span>
                          <span className="text-xs text-muted-foreground">{(item.confidence * 100).toFixed(1)}%</span>
                        </div>
                        {dish ? (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>{dish.description}</p>
                            <div className="flex justify-between">
                              <span>Calories: {dish.calories}</span>
                              <span>Carbs: {dish.carbs_g}g</span>
                              <span>Protein: {dish.protein_g}g</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No additional information available.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No food items were detected in the image. Try uploading a clearer photo of your meal.
                </p>
              )}
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default MealUpload;
