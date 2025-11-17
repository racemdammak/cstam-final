from ultralytics import YOLO
import numpy as np
from PIL import Image
import os

# Load your YOLO model - update the path to your model file
model_path = "models/cstam.pt"
model = YOLO(model_path)

# Map class IDs to food names and nutrition data
# TODO: Update this FOOD_DATABASE with your actual YOLO model classes and nutrition data
FOOD_DATABASE = {
    0: {"name": "Grilled Chicken Breast", "calories": 231, "protein": 43, "carbs": 0, "fat": 5},
    1: {"name": "Steamed White Rice", "calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3},
    2: {"name": "Quinoa", "calories": 120, "protein": 4.4, "carbs": 22, "fat": 1.9},
    3: {"name": "Steamed Broccoli", "calories": 25, "protein": 3, "carbs": 5, "fat": 0.4},
    # Add your other food classes here...
    # Example:
    # 4: {"name": "Apple", "calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3},
}

def detect_meals(image: Image.Image):
    """
    Detect meals in image using YOLO model

    Args:
        image: PIL Image object

    Returns:
        dict: Detection results with nutrition info
    """
    # Run inference
    results = model(image)

    detected_items = []
    total_calories = 0
    total_protein = 0
    total_carbs = 0
    total_fat = 0

    # Process YOLO results
    for result in results:
        boxes = result.boxes
        for box in boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            if class_id in FOOD_DATABASE:
                food_data = FOOD_DATABASE[class_id]
                detected_items.append({
                    "name": food_data["name"],
                    "confidence": confidence,
                    "calories": food_data["calories"],
                    "protein": food_data["protein"],
                    "carbs": food_data["carbs"],
                    "fat": food_data["fat"]
                })

                total_calories += food_data["calories"]
                total_protein += food_data["protein"]
                total_carbs += food_data["carbs"]
                total_fat += food_data["fat"]

    # Generate meal name
    meal_name = generate_meal_name(detected_items)

    # Generate suggestion
    suggestion = generate_suggestion(total_calories, total_protein, total_carbs, total_fat)

    return {
        "items": detected_items,
        "total_calories": total_calories,
        "total_protein": total_protein,
        "total_carbs": total_carbs,
        "total_fat": total_fat,
        "meal_name": meal_name,
        "suggestion": suggestion
    }

def generate_meal_name(items):
    if not items:
        return "Unknown Meal"

    item_names = [item["name"] for item in items]

    if len(item_names) == 1:
        return item_names[0]

    return " with ".join(item_names[:2])

def generate_suggestion(calories, protein, carbs, fat):
    suggestions = []

    if calories < 300:
        suggestions.append("This is a light meal. Consider adding more protein or healthy carbs.")
    elif calories > 800:
        suggestions.append("This is a hearty meal! Great for replenishing energy.")
    else:
        suggestions.append("Well-balanced meal! Good nutrition for your body.")

    return " ".join(suggestions)
