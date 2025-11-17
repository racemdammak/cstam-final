# 🍽️ NutriSense AI

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange.svg)](https://firebase.google.com/)
[![YOLO](https://img.shields.io/badge/YOLO-v8-ultralytics.svg)](https://github.com/ultralytics/ultralytics)

> Your intelligent nutrition companion powered by AI and computer vision. Analyze meals, track wellness goals, and get personalized nutrition advice with the help of Coach Emma.

## ✨ Features

### 🤖 AI-Powered Meal Analysis
- **Computer Vision**: Advanced YOLO model detects food items from photos
- **Nutrition Calculation**: Automatic calorie and macronutrient analysis
- **Smart Suggestions**: Personalized advice based on meal composition
- **High-Energy Alerts**: Special warnings for high-carb or high-calorie meals

### 💬 AI Nutrition Coach
- **Coach Emma**: 24/7 AI nutrition companion
- **Real-time Chat**: WebSocket-powered conversations
- **Personalized Advice**: Context-aware nutrition guidance
- **Progress Tracking**: Motivational support for your wellness journey

### 📊 Comprehensive Tracking
- **Daily Goals**: Track calories, water, steps, sleep, and more
- **Wellness Score**: 33-point scoring system across 11 categories
- **Progress History**: 30-day wellness history tracking
- **Streak Counter**: Daily logging streak motivation

### 🔗 Google Fit Integration
- **Automatic Sync**: Seamless health data import
- **Fitness Metrics**: Steps, sleep, heart rate, distance, active minutes
- **Calorie Tracking**: Burned calories integration
- **Real-time Updates**: Live data synchronization

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on all devices
- **Dark/Light Themes**: Automatic theme switching
- **Smooth Animations**: Framer Motion powered interactions
- **Accessibility**: WCAG compliant design

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **React Query** - Powerful data fetching and caching

### Backend
- **FastAPI** - High-performance Python web framework
- **WebSocket** - Real-time chat functionality
- **YOLOv8** - State-of-the-art object detection
- **Ultralytics** - YOLO implementation
- **Pillow** - Image processing
- **FAISS** - Vector similarity search for chatbot
- **LangChain** - LLM framework integration
- **Groq** - Fast LLM inference

### Database & Auth
- **Firebase Auth** - Secure authentication (Email/Password + Google)
- **Firestore** - NoSQL database for user data
- **Firebase Hosting** - Scalable web hosting

### Integrations
- **Google Fit API** - Health and fitness data
- **Google Cloud** - OAuth and API management

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nutrisense-ai.git
cd nutrisense-ai
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Backend Setup

```bash
# Navigate to API directory
cd api

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r ../requirements.txt

# Start the FastAPI server
python main.py
```

The backend API will be available at `http://localhost:8000`

### 4. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Enable Firestore Database
4. Copy your Firebase config to `src/firebase/config.ts`

### 5. Google Fit Integration (Optional)

1. Enable Google Fit API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized origins for local development
4. Set up test users for development

## 📖 Usage

### Meal Analysis
1. Navigate to the Upload page
2. Take a photo or upload an image of your meal
3. Add an optional description
4. Click "Send Image" to analyze
5. View detailed nutrition breakdown and AI advice

### Chat with Coach Emma
1. Go to the Coach page
2. Enable notifications for real-time responses
3. Ask questions about nutrition, diet, or wellness
4. Get personalized advice and motivation

### Track Your Progress
1. Visit your Profile page
2. View your daily wellness score (out of 33 points)
3. Monitor progress across all goal categories
4. Connect Google Fit for automatic data sync

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (not committed to git):

```env
# Google Fit Integration
VITE_GOOGLE_FIT_CLIENT_ID=your_google_fit_client_id

# Other environment variables as needed
```

### Firebase Config

Update `src/firebase/config.ts` with your Firebase project details:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 📚 API Documentation

### Backend Endpoints

#### Upload Image for Analysis
```http
POST /upload_image
Content-Type: application/json

{
  "image": "base64-encoded-image-data",
  "description": "Optional meal description"
}
```

#### Get Food Data
```http
GET /food_data
```

Returns nutritional information for Tunisian cuisine dishes.

### WebSocket Chat
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

// Send message
ws.send('Hello Coach Emma!');

// Receive response
ws.onmessage = (event) => {
  console.log('Coach:', event.data);
};
```

## 🏗️ Project Structure

```
nutrisense-ai/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API services and utilities
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── firebase/          # Firebase configuration
│   └── assets/            # Static assets
├── api/                   # Python backend
│   ├── main.py           # FastAPI application
│   ├── predict.py        # YOLO prediction logic
│   ├── models/           # ML models
│   └── data/             # Training data and uploads
├── chatbot/              # AI chatbot backend
│   ├── agent.py          # Chatbot logic
│   ├── main.py           # WebSocket server
│   └── processing/       # Text processing utilities
├── public/               # Static files
└── requirements.txt      # Python dependencies
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code passes linting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ultralytics** for the YOLOv8 implementation
- **Google** for Fit API and Firebase
- **OpenAI/Groq** for LLM capabilities
- **shadcn/ui** for beautiful components
- **Framer Motion** for smooth animations

---

**Made with ❤️ for healthy living**

*Transform your nutrition journey with the power of AI and computer vision.*
