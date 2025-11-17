
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useUser, useFirebase } from '@/firebase/provider';
import {
  User as FirebaseUser,
  signOut,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getIdTokenResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'Viewer' | 'Editor' | 'Admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  photoURL?: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: firebaseUser, isUserLoading, userError } = useUser();
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const syncUser = useCallback(async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const tokenResult = await getIdTokenResult(fbUser, true);
      const role = (tokenResult.claims.role || 'Viewer') as UserRole;

      const userDocRef = doc(firestore, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUser({ uid: fbUser.uid, ...userDoc.data(), role } as User);
      } else {
        const photoURL = "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/faceRidepfp.png?alt=media&token=c1ce861e-20f2-4408-b06e-74a80fe13367";
        const newUser: User = {
          uid: fbUser.uid,
          email: fbUser.email!,
          role: role,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL || photoURL,
        };
        await setDoc(userDocRef, newUser);
        setUser(newUser);
      }
    } catch (error) {
      console.error("Error syncing user document:", error);
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    syncUser(firebaseUser);
  }, [firebaseUser, syncUser]);

  useEffect(() => {
    if (!firebaseUser) return;

    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      const localRole = user?.role;
      const remoteRole = snapshot.data()?.role;

      if (snapshot.exists() && remoteRole && localRole && localRole !== remoteRole) {
        console.log("Detected role change in user document, forcing token refresh.");
        syncUser(firebaseUser);
      }
    }, (error) => {
      console.error("Error listening to user document:", error);
    });

    return () => unsubscribe();
  }, [firebaseUser, firestore, syncUser, user]);

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    let email = emailOrUsername;
    if (!emailOrUsername.includes('@')) {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('displayName', '==', emailOrUsername));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
      
      const userData = querySnapshot.docs[0].data();
      email = userData.email;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Firebase Login Error:", error);
      throw error;
    }
  }, [auth, firestore]);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const photoURL = "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/faceRidepfp.png?alt=media&token=c1ce861e-20f2-4408-b06e-74a80fe13367";
    await updateProfile(userCredential.user, { displayName, photoURL });
    await syncUser(userCredential.user);
  }, [auth, syncUser]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, [auth]);

  const updateUserProfile = useCallback(async (updates: { displayName?: string; photoURL?: string }) => {
    if (!firebaseUser) throw new Error("Not authenticated");

    const { displayName, photoURL } = updates;
    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (displayName !== undefined) authUpdates.displayName = displayName;
    if (photoURL !== undefined) authUpdates.photoURL = photoURL;

    await updateProfile(firebaseUser, authUpdates);
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    await updateDocumentNonBlocking(userDocRef, authUpdates);
    setUser(prevUser => prevUser ? { ...prevUser, ...authUpdates } : null);
  }, [firebaseUser, firestore]);

  const forceRefresh = useCallback(async () => {
    if (firebaseUser) {
      await syncUser(firebaseUser);
    }
  }, [firebaseUser, syncUser]);

  const value = {
    user,
    loading: loading || isUserLoading,
    error: userError,
    login,
    signup,
    logout,
    updateUserProfile,
    forceRefresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
