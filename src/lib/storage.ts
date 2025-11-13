'use client';

import { getStorage, ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { app } from '@/firebase';

/**
 * Uploads a file to Firebase Storage with progress tracking.
 * @param file The file to upload.
 *
 * @param path The path in the storage bucket to upload the file to.
 * @param onProgress A callback function to track upload progress.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for upload.'));
    }

    const storage = getStorage(app);

    const fileName = `${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Error uploading file:', error);
        reject(new Error('File upload failed.'));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          console.error('Error getting download URL:', error);
          reject(new Error('Could not get file download URL.'));
        }
      }
    );
  });
};
