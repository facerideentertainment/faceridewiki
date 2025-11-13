'use client';

import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to wrap Firestore operations, emit a specific error on failure, and re-throw the error.
async function handleFirestoreOperation<T>(
  operation: Promise<T>,
  details: { path: string; operation: 'write' | 'create' | 'update' | 'delete'; requestResourceData?: any }
): Promise<T> {
  try {
    // Await the actual Firestore operation
    return await operation;
  } catch (error) {
    // Create a structured permission error.
    const permissionError = new FirestorePermissionError({ ...details, originalError: error as FirestoreError });
    
    // Emit the error for any global listeners (like the UI error display).
    errorEmitter.emit('permission-error', permissionError);
    
    // CRITICAL: Re-throw the error so that the function that called this
    // knows that the operation failed and can handle it properly.
    throw permissionError;
  }
}

/**
 * Performs a setDoc operation and throws a structured error on failure.
 * This is no longer "non-blocking" in the "fire-and-forget" sense.
 * It now returns a promise that resolves or rejects based on the operation's outcome.
 */
export async function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  return handleFirestoreOperation(
    setDoc(docRef, data, options),
    {
      path: docRef.path,
      operation: 'write',
      requestResourceData: data,
    }
  );
}

/**
 * Performs an addDoc operation and throws a structured error on failure.
 */
export async function addDocumentNonBlocking(colRef: CollectionReference, data: any): Promise<DocumentReference> {
  return handleFirestoreOperation(
    addDoc(colRef, data),
    {
      path: colRef.path,
      operation: 'create',
      requestResourceData: data,
    }
  );
}

/**
 * Performs an updateDoc operation and throws a structured error on failure.
 */
export async function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  return handleFirestoreOperation(
    updateDoc(docRef, data),
    {
      path: docRef.path,
      operation: 'update',
      requestResourceData: data,
    }
  );
}

/**
 * Performs a deleteDoc operation and throws a structured error on failure.
 */
export async function deleteDocumentNonBlocking(docRef: DocumentReference) {
  return handleFirestoreOperation(
    deleteDoc(docRef),
    {
      path: docRef.path,
      operation: 'delete',
    }
  );
}
