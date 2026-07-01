'use client';

import React, { createContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutUser,
} from '@/lib/firebase/auth';
import type { LoginInput, SignupInput } from '@aelpt/shared';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  createdAt: string;
  onboardingDone: boolean;
  role: 'student' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: SignupInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch the user profile from the backend
  const fetchProfile = async (
    currentUser: User
  ): Promise<UserProfile | null> => {
    try {
      const token = await currentUser.getIdToken();
      const baseUrl =
        process.env['NEXT_PUBLIC_API_BASE_URL'] ||
        'http://localhost:3001/api/v1';

      const response = await fetch(`${baseUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const json = (await response.json()) as { data: UserProfile };
        return json.data;
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
    return null;
  };

  const refreshProfile = async (): Promise<void> => {
    if (auth.currentUser !== null) {
      const p = await fetchProfile(auth.currentUser);
      setProfile(p);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser !== null) {
        // Fetch detailed profile from backend
        const p = await fetchProfile(currentUser);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (input: LoginInput): Promise<void> => {
    setLoading(true);
    try {
      await signInWithEmail(input);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (input: SignupInput): Promise<void> => {
    setLoading(true);
    try {
      const credential = await signUpWithEmail(input);
      const currentUser = credential.user;

      // On signup, trigger profile creation in Firestore via backend
      if (currentUser !== null) {
        const token = await currentUser.getIdToken();
        const baseUrl =
          process.env['NEXT_PUBLIC_API_BASE_URL'] ||
          'http://localhost:3001/api/v1';

        const profileResponse = await fetch(`${baseUrl}/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: input.fullName,
          }),
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to synchronize user profile on signup');
        }

        const json = (await profileResponse.json()) as { data: UserProfile };
        setProfile(json.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleWeb = async (): Promise<void> => {
    setLoading(true);
    try {
      const credential = await signInWithGoogle();
      const currentUser = credential.user;

      if (currentUser !== null) {
        const token = await currentUser.getIdToken();
        const baseUrl =
          process.env['NEXT_PUBLIC_API_BASE_URL'] ||
          'http://localhost:3001/api/v1';

        // Attempt to create profile if this is the first time Google OAuth is used.
        // The backend handler will safely perform an upsert/noop if profile exists.
        await fetch(`${baseUrl}/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: currentUser.displayName || 'Google User',
          }),
        });

        const p = await fetchProfile(currentUser);
        setProfile(p);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle: signInWithGoogleWeb,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
