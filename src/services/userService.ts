import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/firebase/config";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  activityLevel?: string;
  goal?: string;
  dietPlan?: string;
  customCarbs?: number;
  customProtein?: number;
  customFat?: number;
  createdAt: any;
  updatedAt: any;
}

export interface UserDataset {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  meals: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    time: string;
  }>;
}

// Helper function to remove undefined values from an object
function removeUndefinedValues(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
}

// Create or update user profile
export async function createUserProfile(
  userId: string, 
  userData: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, "users", userId);
  
  // Remove undefined values before saving
  const cleanData = removeUndefinedValues({
    ...userData,
    uid: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  await setDoc(userRef, cleanData, { merge: true });
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, "users", userId);
  
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Save daily nutrition data
export async function saveNutritionData(
  userId: string,
  date: string,
  data: UserDataset
): Promise<void> {
  const dataRef = doc(db, "users", userId, "nutrition", date);
  
  await setDoc(dataRef, {
    ...data,
    date,
    timestamp: serverTimestamp(),
  }, { merge: true });
}

// Get daily nutrition data
export async function getNutritionData(
  userId: string,
  date: string
): Promise<UserDataset | null> {
  const dataRef = doc(db, "users", userId, "nutrition", date);
  const dataSnap = await getDoc(dataRef);

  if (dataSnap.exists()) {
    return dataSnap.data() as UserDataset;
  }
  return null;
}

// Get all nutrition data for a user
export async function getAllNutritionData(
  userId: string
): Promise<UserDataset[]> {
  const { collection, getDocs } = await import("firebase/firestore");
  const nutritionRef = collection(db, "users", userId, "nutrition");
  const querySnapshot = await getDocs(nutritionRef);
  
  const data: UserDataset[] = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data() as UserDataset);
  });
  
  return data;
}
