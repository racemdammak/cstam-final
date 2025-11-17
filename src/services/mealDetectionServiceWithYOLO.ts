// YOLO-enabled meal detection service
// This service connects to your Python backend API running YOLO model

export interface MealItem {
  name: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealAnalysis {
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealName: string;
  suggestion: string;
}

// API endpoint for YOLO backend
const YOLO_API_URL = import.meta.env.VITE_YOLO_API_URL || "http://localhost:8000/api/detect-meal";

/**
 * Analyze meal image using YOLO model via backend API
 */
export async function analyzeMealImageWithYOLO(
  imageData: string,
  description?: string
): Promise<MealAnalysis> {
  try {
    // Convert base64 image to Blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", blob, "meal.jpg");
    
    // Send to YOLO backend API
    const apiResponse = await fetch(YOLO_API_URL, {
      method: "POST",
      body: formData,
    });
    
    if (!apiResponse.ok) {
      throw new Error(`API error: ${apiResponse.statusText}`);
    }
    
    const data = await apiResponse.json();
    
    // Return formatted response
    return {
      items: data.items || [],
      totalCalories: data.totalCalories || 0,
      totalProtein: data.totalProtein || 0,
      totalCarbs: data.totalCarbs || 0,
      totalFat: data.totalFat || 0,
      mealName: data.mealName || "Unknown Meal",
      suggestion: data.suggestion || "No suggestion available",
    };
  } catch (error) {
    console.error("YOLO detection error:", error);
    
    // Fallback to simulated detection if YOLO API fails
    console.log("Falling back to simulated detection...");
    return analyzeMealImageSimulated(imageData, description);
  }
}

/**
 * Fallback: Simulated meal detection (original implementation)
 */
async function analyzeMealImageSimulated(
  imageData: string,
  description?: string
): Promise<MealAnalysis> {
  // Import the original simulated function
  const { analyzeMealImage } = await import("./mealDetectionService");
  return analyzeMealImage(imageData, description);
}

// Export the YOLO function as default
export const analyzeMealImage = analyzeMealImageWithYOLO;
