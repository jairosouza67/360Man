import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { uploadAvatar as uploadAvatarToStorage } from '../lib/storage';
import { DietPlan, WorkoutPlan, FinancialAudit, RelationalAudit } from '../lib/ai';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  emailVerified: boolean;
}

export interface FinancialTransaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
}

interface Profile {
  id: string;
  userId: string;
  avatar?: string;
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goals?: string[];
  restrictions?: string[];
  experienceLevel?: string;
  dailyTimePreference?: string;
  consentFlags?: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
  };
  workSchedule?: string;
  sleepHours?: number;
  allergies?: string[];
  injuries?: string[];
  priorityGoals?: string[];
  
  // Tool Data
  dietPlan?: DietPlan;
  workoutPlan?: WorkoutPlan;
  financialData?: {
      transactions: FinancialTransaction[];
      goal: string;
      lastAudit?: FinancialAudit;
  };
  relationalAudit?: RelationalAudit;
}

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  
  // Tool Actions
  saveDietPlan: (plan: DietPlan | undefined) => Promise<void>;
  saveWorkoutPlan: (plan: WorkoutPlan | undefined) => Promise<void>;
  saveFinancialData: (data: Profile['financialData']) => Promise<void>;
  saveRelationalAudit: (audit: RelationalAudit | undefined) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          let profile: Profile | null = null;
          try {
            const docRef = doc(db, 'profiles', firebaseUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              profile = { id: docSnap.id, ...docSnap.data() } as Profile;
            }
          } catch (err) {
            console.error('Failed to load profile (possibly offline):', err);
            profile = null;
          }

            set({
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || '',
                avatar: (firebaseUser.photoURL || (profile && profile.avatar)) ?? null,
                emailVerified: firebaseUser.emailVerified
              },
              profile,
              loading: false,
              initialized: true
            });
        } else {
          set({
            user: null,
            profile: null,
            loading: false,
            initialized: true
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false, initialized: true });
    }
  },

  login: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    // Request additional scopes for profile information
    provider.addScope('profile');
    provider.addScope('email');
    
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Log user data for debugging
    console.log('Google user data:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    });

    // Extract profile information from Google
    const profileData = {
      userId: user.uid,
      name: user.displayName || '',
      avatar: user.photoURL || '',
      email: user.email || '',
      emailVerified: user.emailVerified || false,
      updatedAt: new Date().toISOString(),
      // Store additional user metadata from Google
      metadata: {
        createdAt: user.metadata?.creationTime || null,
        lastSignInTime: user.metadata?.lastSignInTime || null,
        phoneNumber: user.phoneNumber || null
      }
    } as any;

    try {
      await setDoc(doc(db, 'profiles', user.uid), profileData, { merge: true });
      
      // Update the local store with user data
      set({
        user: {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          avatar: user.photoURL || null,
          emailVerified: user.emailVerified
        }
      });
    } catch (err) {
      console.error('Failed to create or merge profile for Google sign-in', err);
      throw err;
    }
  },

  register: async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const profileData = {
      userId: user.uid,
      name: name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'profiles', user.uid), profileData);
    set({
      user: {
        id: user.uid,
        email: user.email!,
        name: name || '',
        emailVerified: user.emailVerified
      },
      profile: { id: user.uid, ...profileData } as Profile
    });
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, profile: null });
  },

  loadProfile: async (userId: string) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profile = { id: docSnap.id, ...docSnap.data() } as Profile;
        set({ profile });
      }
    } catch (err) {
      console.error('Failed to load profile in loadProfile:', err);
    }
  },

  updateProfile: async (data) => {
    const { user, profile } = get();
    if (!user) throw new Error('User not authenticated');
    const docRef = doc(db, 'profiles', user.id);
    const timestamp = new Date().toISOString();

    // If no profile is present locally, create/merge the profile document
    if (!profile) {
      const newProfile = { id: user.id, userId: user.id, ...data, updatedAt: timestamp } as Profile;
      await setDoc(docRef, newProfile, { merge: true });
      set({ profile: newProfile });
      return;
    }

    // Otherwise update existing profile document
    await updateDoc(docRef, { ...data, updatedAt: timestamp });
    set({ profile: { ...profile, ...data } });
  },

  uploadAvatar: async (file: File) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');
    const avatarUrl = await uploadAvatarToStorage(file, user.id);
    await get().updateProfile({ avatar: avatarUrl });
  },

  // Tool Actions Implementation
  saveDietPlan: async (plan) => {
      await get().updateProfile({ dietPlan: plan });
  },
  saveWorkoutPlan: async (plan) => {
      await get().updateProfile({ workoutPlan: plan });
  },
  saveFinancialData: async (data) => {
      await get().updateProfile({ financialData: data });
  },
  saveRelationalAudit: async (audit) => {
      await get().updateProfile({ relationalAudit: audit });
  }
}));