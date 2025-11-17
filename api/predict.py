from ultralytics import YOLO
import os
import glob

# ==========================
# 🔧 Load your trained model
# ==========================
model = YOLO("models/cstam.pt")

def predict_meal(image_path: str) -> list:
    """
    Predict meal items from image and return detected items.
    """
    print(f"🔍 Running detection on: {image_path}")
    try:
        results = model.predict(source=image_path, conf=0.5, save=True)
        print(f"✅ Detection done!")
    except Exception as e:
        print(f"❌ Prediction failed: {e}")
        return []

    # Extract detected items
    detected_items = []
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls.item())
            class_name = result.names[class_id]
            confidence = box.conf.item()
            detected_items.append({
                "item": class_name,
                "confidence": round(confidence, 2)
            })

    return detected_items
