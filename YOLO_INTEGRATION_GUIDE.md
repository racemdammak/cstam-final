# YOLO Model Integration Guide

This guide explains how to integrate your custom YOLO model into the NutriSense AI meal detection system.

## Prerequisites

- Your trained YOLO model (`.pt`, `.onnx`, or `.tflite` format)
- Python 3.8+ (for backend API approach)
- OR TensorFlow.js/ONNX.js (for browser-based approach)

## Integration Options

### Option 1: Python Backend API (Recommended)

This approach runs your YOLO model on a Python backend server.

#### Step 1: Create Python Backend

Create a new directory `backend/` with the following structure:

```
backend/
├── app.py
├── model.py
├── requirements.txt
└── models/
    └── your_yolo_model.pt
```

#### Step 2: Install Dependencies

Create `backend/requirements.txt`:

```txt
fastapi==0.104.1
uvicorn==0.24.0
ultralytics==8.0.196
numpy==1.24.3
pillow==10.0.1
python-multipart==0.0.6
```

#### Step 3: Create API Endpoint

Create `backend/app.py`:

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import detect_meals
import base64
from io import BytesIO
from PIL import Image

app = FastAPI()

# Enable CORS for React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/detect-meal")
async def detect_meal(file: UploadFile = File(...)):
    try:
        # Read image
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        
        # Run YOLO detection
        results = detect_meals(image)
        
        return {
            "items": results["items"],
            "totalCalories": results["total_calories"],
            "totalProtein": results["total_protein"],
            "totalCarbs": results["total_carbs"],
            "totalFat": results["total_fat"],
            "mealName": results["meal_name"],
            "suggestion": results["suggestion"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### Step 4: Create Model Detection Script

Create `backend/model.py`:

```python
from ultralytics import YOLO
import numpy as np
from PIL import Image
import os

# Load your YOLO model
model_path = "models/your_yolo_model.pt"
model = YOLO(model_path)

# Map class IDs to food names and nutrition data
FOOD_DATABASE = {
    0: {"name": "Grilled Chicken Breast", "calories": 231, "protein": 43, "carbs": 0, "fat": 5},
    1: {"name": "Steamed White Rice", "calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3},
    2: {"name": "Quinoa", "calories": 120, "protein": 4.4, "carbs": 22, "fat": 1.9},
    3: {"name": "Steamed Broccoli", "calories": 25, "protein": 3, "carbs": 5, "fat": 0.4},
    # Add your other food classes...
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
```

#### Step 5: Run Backend Server

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Option 2: Browser-based with TensorFlow.js

If you want to run the model directly in the browser, convert your YOLO model to TensorFlow.js format.

#### Step 1: Convert YOLO to TensorFlow.js

```bash
# Install TensorFlow.js converter
pip install tensorflowjs

# Convert your model
tensorflowjs_converter --input_format=tf_saved_model \
    saved_model/ \
    web_model/
```

#### Step 2: Update Frontend Service

The updated service file `src/services/mealDetectionServiceWithYOLO.ts` has been created for you.

#### Step 3: Update Environment Variables

Create a `.env` file in the root directory:

```env
VITE_YOLO_API_URL=http://localhost:8000/api/detect-meal
```

#### Step 4: Update Import in MealUpload.tsx

Change the import in `src/pages/MealUpload.tsx`:

```typescript
// Change from:
import { analyzeMealImage, type MealAnalysis } from "@/services/mealDetectionService";

// To:
import { analyzeMealImage, type MealAnalysis } from "@/services/mealDetectionServiceWithYOLO";
```

## Quick Start

### Setup Backend (Python API)

1. Create the backend directory and files as shown above
2. Place your YOLO model in `backend/models/your_yolo_model.pt`
3. Update the `FOOD_DATABASE` dictionary in `backend/model.py` with your food classes
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn app:app --reload --port 8000`

### Update Frontend

1. Update the import in `MealUpload.tsx` to use the YOLO service
2. Add `.env` file with API URL
3. Restart your React dev server

## Testing

1. Upload an image using the app
2. The app will send the image to your YOLO backend
3. YOLO will detect food items and return nutrition data
4. Results will display in the Results page

## Troubleshooting

- **CORS Error**: Make sure CORS is enabled in `backend/app.py`
- **Model Not Found**: Check that your model path in `model.py` is correct
- **API Connection Failed**: Verify the backend is running on port 8000
- **No Detections**: Check that your model classes match the `FOOD_DATABASE`

## Customization

- Modify `FOOD_DATABASE` to match your YOLO model's classes
- Adjust confidence thresholds in the detection function
- Add more nutrition data for each food class
- Customize meal name generation and suggestions
