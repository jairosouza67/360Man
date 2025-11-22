import { create } from 'zustand';
import { db, auth } from '../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

// Helper to remove undefined values from objects
const sanitizeData = (data: any) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
};

export interface TrackerEntry {
  id: string;
  userId: string;
  type: 'workout' | 'sleep' | 'reading' | 'sexuality' | 'posture' | 'habits' | 'diet' | 'meditation' | 'journal' | 'affective' | 'career' | 'community' | 'body_photo' | 'body_measurement' | 'habit_log' | 'weekly_metric' | 'water';
  date: string;
  value: any;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  userId: string;
  title: string;
  description: string;
  duration: number; // days
  pillars: string[];
  objectives: string[];
  dailyTasks: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    duration: number;
    completed: boolean;
    date: string;
  }>;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  type: 'boolean' | 'numeric' | 'time';
  goal?: number;
  unit?: string;
  color?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  deadline: string;
  category: string;
  checklist: { id: string; text: string; completed: boolean }[];
  type: 'manual' | 'measurement' | 'tracker';
  target?: {
    metric: string;
    value: number;
    operator: '<=' | '>=' | '==';
  };
  status: 'active' | 'completed';
  progress: number;
  actionPlan?: string;
  result?: string;
  createdAt: string;
}

interface TrackerStore {
  trackers: TrackerEntry[];
  habits: Habit[];
  goals: Goal[];
  plans: Plan[];
  currentPlan: Plan | null;
  loading: boolean;

  loadTrackers: (userId: string, startDate?: string, endDate?: string) => Promise<void>;
  loadPlans: (userId: string) => Promise<void>;
  createTracker: (data: Omit<TrackerEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTracker: (id: string, data: Partial<TrackerEntry>) => Promise<void>;
  deleteTracker: (id: string) => Promise<void>;
  createPlan: (planData: any) => Promise<Plan>;
  updatePlanProgress: (planId: string, progress: number) => Promise<void>;
  getStreak: (userId: string, type: string) => Promise<number>;
  saveTrackerValue: (userId: string, date: string, type: string, value: any) => Promise<void>;
  exportTrackers: (userId: string, format: 'csv' | 'json') => Promise<string>;

  // Habit Actions
  loadHabits: (userId: string) => Promise<void>;
  createHabit: (data: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Goal Actions
  loadGoals: (userId: string) => Promise<void>;
  createGoal: (data: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  checkGoals: () => Promise<void>;
}

export const useTrackerStore = create<TrackerStore>((set, get) => ({
  trackers: [],
  habits: [],
  goals: [],
  plans: [],
  currentPlan: null,
  loading: false,

  loadTrackers: async (userId: string, startDate?: string, endDate?: string) => {
    try {
      set({ loading: true });
      const trackersRef = collection(db, 'trackers');
      let q = query(trackersRef, where('userId', '==', userId));

      if (startDate) q = query(q, where('date', '>=', startDate));
      if (endDate) q = query(q, where('date', '<=', endDate));

      const querySnapshot = await getDocs(q);
      const trackers: TrackerEntry[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        trackers.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          date: data.date,
          value: data.value,
          metadata: data.metadata || {},
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as TrackerEntry);
      });

      set({ trackers, loading: false });
    } catch (error) {
      console.error('Load trackers error:', error);
      set({ loading: false });
    }
  },

  loadPlans: async (userId: string) => {
    try {
      console.log(`Loading plans for user: ${userId}`);
      const plansRef = collection(db, 'plans');
      // Removed orderBy to avoid composite index requirement
      const q = query(plansRef, where('userId', '==', userId));

      const querySnapshot = await getDocs(q);
      const plans: Plan[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        plans.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          duration: data.duration,
          pillars: data.pillars || [],
          objectives: data.objectives || [],
          dailyTasks: data.dailyTasks || [],
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          progress: data.progress || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Plan);
      });

      // Sort client-side
      plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const currentPlan = plans.find(p => p.status === 'active') || null;
      set({ plans, currentPlan });
    } catch (error: any) {
      console.error('Load plans error:', error);
    }
  },

  createTracker: async (data: Omit<TrackerEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const now = new Date().toISOString();
      const trackerData = sanitizeData({
        ...data,
        userId: currentUser.uid, // Enforce auth ID
        createdAt: now,
        updatedAt: now
      });

      const docRef = await addDoc(collection(db, 'trackers'), trackerData);

      const newTracker: TrackerEntry = {
        id: docRef.id,
        ...trackerData
      } as TrackerEntry;

      set(state => ({ trackers: [...state.trackers, newTracker] }));

      // Check goals after creating tracker
      const { checkGoals } = get();
      await checkGoals();
    } catch (error) {
      console.error('Create tracker error:', error);
      throw error;
    }
  },

  updateTracker: async (id: string, data: Partial<TrackerEntry>) => {
    try {
      const now = new Date().toISOString();
      const updateData = sanitizeData({
        ...data,
        updatedAt: now
      });

      const docRef = doc(db, 'trackers', id);
      await updateDoc(docRef, updateData);

      set(state => ({
        trackers: state.trackers.map(t =>
          t.id === id ? { ...t, ...updateData } : t
        )
      }));
    } catch (error) {
      console.error('Update tracker error:', error);
      throw error;
    }
  },

  deleteTracker: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'trackers', id));

      set(state => ({
        trackers: state.trackers.filter(t => t.id !== id)
      }));
    } catch (error) {
      console.error('Delete tracker error:', error);
      throw error;
    }
  },

  createPlan: async (planData: any) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const now = new Date().toISOString();
      const newPlanData = sanitizeData({
        ...planData,
        userId: currentUser.uid, // Enforce auth ID
        status: 'active',
        progress: 0,
        startDate: now,
        endDate: new Date(Date.now() + planData.duration * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now,
        updatedAt: now
      });

      const docRef = await addDoc(collection(db, 'plans'), newPlanData);

      const newPlan: Plan = {
        id: docRef.id,
        ...newPlanData
      } as Plan;

      set(state => ({
        plans: [newPlan, ...state.plans],
        currentPlan: newPlan
      }));

      return newPlan;
    } catch (error) {
      console.error('Create plan error:', error);
      throw error;
    }
  },

  updatePlanProgress: async (planId: string, progress: number) => {
    try {
      const docRef = doc(db, 'plans', planId);
      await updateDoc(docRef, { progress });

      set(state => ({
        plans: state.plans.map(p =>
          p.id === planId ? { ...p, progress } : p
        ),
        currentPlan: state.currentPlan?.id === planId
          ? { ...state.currentPlan, progress }
          : state.currentPlan
      }));
    } catch (error) {
      console.error('Update plan progress error:', error);
      throw error;
    }
  },

  getStreak: async (userId: string, type: string) => {
    const { trackers } = get();
    const userTrackers = trackers.filter(t => t.userId === userId && t.type === type);

    if (userTrackers.length === 0) return 0;

    // Sort by date descending
    const sortedTrackers = userTrackers.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedTrackers.length; i++) {
      const trackerDate = new Date(sortedTrackers[i].date);
      trackerDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (trackerDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  saveTrackerValue: async (userId: string, date: string, type: string, value: any) => {
    try {
      const { trackers, updateTracker, createTracker } = get();
      const existingTracker = trackers.find(t =>
        t.userId === userId &&
        t.date === date &&
        t.type === type
      );

      if (existingTracker) {
        await updateTracker(existingTracker.id, { value });
      } else {
        await createTracker({
          userId,
          type: type as any,
          date,
          value,
          metadata: {}
        });
      }
      // Check goals after saving value
      const { checkGoals } = get();
      await checkGoals();
    } catch (error) {
      console.error('Save tracker value error:', error);
      throw error;
    }
  },

  exportTrackers: async (userId: string, format: 'csv' | 'json') => {
    const { trackers } = get();
    const userTrackers = trackers.filter(t => t.userId === userId);

    if (format === 'json') {
      return JSON.stringify(userTrackers, null, 2);
    } else {
      // CSV format
      const headers = ['Date', 'Type', 'Value', 'Created At'];
      const rows = userTrackers.map(t => [
        t.date,
        t.type,
        JSON.stringify(t.value),
        t.createdAt
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  },

  loadHabits: async (userId: string) => {
    try {
      console.log(`Loading habits for user: ${userId}`);
      const habitsRef = collection(db, 'habits');
      const q = query(habitsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const habits: Habit[] = [];

      querySnapshot.forEach((doc) => {
        habits.push({ id: doc.id, ...doc.data() } as Habit);
      });

      set({ habits });
    } catch (error) {
      console.error('Load habits error:', error);
    }
  },

  createHabit: async (data: Omit<Habit, 'id' | 'createdAt'>) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      console.log('trackerStore.createHabit called with:', data);
      const now = new Date().toISOString();
      const habitData = sanitizeData({
        ...data,
        userId: currentUser.uid, // Enforce auth ID
        createdAt: now
      });
      console.log('Adding habit to Firestore...');
      const docRef = await addDoc(collection(db, 'habits'), habitData);
      console.log('Habit added to Firestore with ID:', docRef.id);

      const newHabit: Habit = { id: docRef.id, ...habitData };
      set(state => ({ habits: [...state.habits, newHabit] }));
      console.log('Habit added to state successfully');
    } catch (error: any) {
      console.error('Create habit error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        name: error.name
      });
      throw error;
    }
  },

  deleteHabit: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'habits', id));
      set(state => ({ habits: state.habits.filter(h => h.id !== id) }));
    } catch (error) {
      console.error('Delete habit error:', error);
      throw error;
    }
  },

  loadGoals: async (userId: string) => {
    try {
      const currentUser = auth.currentUser;
      console.log(`[DEBUG] Load goals - Requested userId: ${userId}`);
      console.log(`[DEBUG] Load goals - Auth currentUser.uid: ${currentUser?.uid}`);

      if (currentUser?.uid !== userId) {
        console.warn('[DEBUG] Load goals - Mismatch between requested userId and auth uid!');
      }

      const goalsRef = collection(db, 'goals');
      const q = query(goalsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const goals: Goal[] = [];

      querySnapshot.forEach((doc) => {
        goals.push({ id: doc.id, ...doc.data() } as Goal);
      });

      set({ goals });
    } catch (error) {
      console.error('Load goals error:', error);
    }
  },

  createGoal: async (data: Omit<Goal, 'id' | 'createdAt'>) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      console.log('[DEBUG] Create goal - Auth currentUser.uid:', currentUser.uid);
      console.log('[DEBUG] Create goal - Input data:', data);

      const now = new Date().toISOString();
      const goalData = sanitizeData({
        ...data,
        userId: currentUser.uid, // Enforce auth ID
        createdAt: now
      });

      console.log('[DEBUG] Create goal - Final Payload:', JSON.stringify(goalData, null, 2));
      console.log('Adding goal to Firestore...');

      const docRef = await addDoc(collection(db, 'goals'), goalData);
      console.log('Goal added to Firestore with ID:', docRef.id);

      const newGoal: Goal = { id: docRef.id, ...goalData };
      set(state => ({ goals: [...state.goals, newGoal] }));
      console.log('Goal added to state successfully');
    } catch (error: any) {
      console.error('Create goal error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        name: error.name
      });
      throw error;
    }
  },

  updateGoal: async (id: string, data: Partial<Goal>) => {
    try {
      const docRef = doc(db, 'goals', id);
      await updateDoc(docRef, data);

      set(state => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...data } : g)
      }));
    } catch (error) {
      console.error('Update goal error:', error);
      throw error;
    }
  },

  deleteGoal: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'goals', id));
      set(state => ({ goals: state.goals.filter(g => g.id !== id) }));
    } catch (error) {
      console.error('Delete goal error:', error);
      throw error;
    }
  },

  checkGoals: async () => {
    const { goals, trackers, updateGoal } = get();
    const activeGoals = goals.filter(g => g.status === 'active');

    for (const goal of activeGoals) {
      let newProgress = goal.progress;
      let shouldUpdate = false;

      if (goal.type === 'measurement' && goal.target) {
        // Find latest measurement for this metric
        const measurements = trackers
          .filter(t => t.type === 'body_measurement')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const latest = measurements[0];
        if (latest && latest.value[goal.target.metric]) {
          const currentVal = parseFloat(latest.value[goal.target.metric]);
          const targetVal = goal.target.value;

          // Calculate progress based on operator
          if (goal.target.operator === '<=') {
            if (currentVal <= targetVal) newProgress = 100;
            else newProgress = Math.min(100, Math.max(0, (targetVal / currentVal) * 100));
          } else if (goal.target.operator === '>=') {
            newProgress = Math.min(100, (currentVal / targetVal) * 100);
          }
          shouldUpdate = true;
        }
      } else if (goal.type === 'tracker' && goal.target) {
        // Count trackers
        const count = trackers.filter(t => t.type === goal.target!.metric).length;
        newProgress = Math.min(100, (count / goal.target.value) * 100);
        shouldUpdate = true;
      }

      if (shouldUpdate && newProgress !== goal.progress) {
        await updateGoal(goal.id, {
          progress: Math.round(newProgress),
          status: newProgress >= 100 ? 'completed' : 'active'
        });
      }
    }
  }
}));