from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import base64
import os
from datetime import datetime
from pydantic import BaseModel
from predict import predict_meal

app = FastAPI()

origins = [
    "http://localhost:5173", #React dev server
    "http://localhost:8080", #Another dev server
    "http://localhost:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UploadImageRequest(BaseModel):
    image: str

@app.post("/upload_image")
async def upload_image(request: UploadImageRequest):
    try:
        print(f"Received image request: {request.image[:100]}...")
        # Decode the base64 image
        parts = request.image.split(',')
        if len(parts) < 2:
            raise ValueError("Invalid image format")
        image_data = base64.b64decode(parts[1])

        # Create uploads directory if not exists
        upload_dir = "data"
        os.makedirs(upload_dir, exist_ok=True)

        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"meal_{timestamp}.png"
        filepath = os.path.join(upload_dir, filename)

        # Save the image
        with open(filepath, "wb") as f:
            f.write(image_data)

        print(f"Image saved to {filepath}")

        # Run prediction on the uploaded image
        detected_items = predict_meal(filepath)

        return {
            "message": "Image uploaded and analyzed successfully",
            "filename": filename,
            "detected_items": detected_items
        }
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/food_data")
async def get_food_data():
    print("Fetching food data...")
    try:
        food_data_file = "food_data.json"
        if not os.path.exists(food_data_file):
            raise FileNotFoundError("Food data file not found")

        with open(food_data_file, "r") as f:
            food_data = f.read()

        return {
            "food_data": food_data
        }
    except Exception as e:
        print(f"Food data retrieval error: {e}")
        raise HTTPException(status_code=400, detail=str(e))