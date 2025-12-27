import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from './analysis/types';

interface AppState {
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile) => void;
    clearUserProfile: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            userProfile: null,
            setUserProfile: (profile) => set({ userProfile: profile }),
            clearUserProfile: () => set({ userProfile: null }),
        }),
        {
            name: 'posture-app-storage',
        }
    )
);
