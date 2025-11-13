'use client';

import React from 'react';
import { FirebaseProvider } from '@/firebase/provider';

// This is the single client-side entry point for Firebase.
// It should be used in layout.tsx to wrap the entire app.

export const ClientFirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
};
