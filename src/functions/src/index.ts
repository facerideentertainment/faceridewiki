
import { getAuth } from "firebase-admin/auth";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getStorage } from "firebase-admin/storage";
import { defineString } from "firebase-functions/params";

// This is a workaround for a bug in the Firebase Admin SDK
// where the GOOGLE_APPLICATION_CREDENTIALS environment variable is not
// picked up by the Storage module.
//
// This is not a security risk, as the Admin SDK will still use the
// service account credentials to sign requests.
// See: https://github.com/firebase/firebase-admin-node/issues/2129
const GCS_BUCKET = defineString("GCS_BUCKET");

initializeApp();

export const makeFirstUserAdmin = onCall(async (request) => {
  // if (request.app == undefined) {
  //   throw new HttpsError(
  //     "failed-precondition",
  //     "The function must be called from an App Check verified app."
  //   );
  // }

  const auth = getAuth();
  const firestore = getFirestore();

  try {
    // Check if any user has the 'Admin' role
    const querySnapshot = await firestore.collection("users").where("role", "==", "Admin").get();
    if (!querySnapshot.empty) {
      throw new HttpsError("already-exists", "An admin user already exists.");
    }

    // Get the UID from the calling user
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "You must be logged in to call this function.");
    }

    // Set the custom claim
    await auth.setCustomUserClaims(uid, { role: "Admin" });

    // Update the user's document in Firestore
    await firestore.collection("users").doc(uid).update({ role: "Admin" });

    return { message: `Successfully made user ${uid} an admin.` };
  } catch (error) {
    console.error("Error in makeFirstUserAdmin:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "An internal error occurred.");
  }
});

// This function is triggered when a user document is updated.
// It copies the user's displayName and photoURL to all the wiki pages
// they have authored or last edited.
export const onUserUpdate = onDocumentUpdated("users/{userId}", async (event) => {
  const userId = event.params.userId;
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();

  if (!beforeData || !afterData) {
    console.log("No data change, exiting function.");
    return;
  }

  const newDisplayName = afterData.displayName;
  const oldDisplayName = beforeData.displayName;
  const newPhotoURL = afterData.photoURL;
  const oldPhotoURL = beforeData.photoURL;

  // If the displayName and photoURL have not changed, do nothing
  if (newDisplayName === oldDisplayName && newPhotoURL === oldPhotoURL) {
    console.log("No change in displayName or photoURL, exiting function.");
    return;
  }

  const firestore = getFirestore();
  const batch = firestore.batch();

  try {
    // Query for wiki pages where the user is the author
    const authorQuery = firestore.collection('wiki_pages').where('authorId', '==', userId);
    const authorSnapshot = await authorQuery.get();
    authorSnapshot.forEach(doc => {
      const updateData: { authorDisplayName?: string, authorPhotoURL?: string } = {};
      if (newDisplayName !== oldDisplayName) {
        updateData.authorDisplayName = newDisplayName;
      }
      if (newPhotoURL !== oldPhotoURL) {
        updateData.authorPhotoURL = newPhotoURL;
      }
      if (Object.keys(updateData).length > 0) {
        batch.update(doc.ref, updateData);
      }
    });

    // Query for wiki pages where the user is the last editor
    const editorQuery = firestore.collection('wiki_pages').where('lastEditorId', '==', userId);
    const editorSnapshot = await editorQuery.get();
    editorSnapshot.forEach(doc => {
      const updateData: { lastEditorDisplayName?: string, lastEditorPhotoURL?: string } = {};
      if (newDisplayName !== oldDisplayName) {
        updateData.lastEditorDisplayName = newDisplayName;
      }
      if (newPhotoURL !== oldPhotoURL) {
        updateData.lastEditorPhotoURL = newPhotoURL;
      }
      if (Object.keys(updateData).length > 0) {
        batch.update(doc.ref, updateData);
      }
    });

    await batch.commit();
    console.log(`Successfully updated display name and photo URL for user ${userId} on all relevant pages.`);
  } catch (error) {
    console.error("Error updating user details on wiki pages:", error);
  }
});


/**
 * AppCheck enforcement is disabled for this function.
 * @see {@link https://firebase.google.com/docs/app-check/cloud-functions}
 */
export const getUnsplashImages = onCall({ enforceAppCheck: false }, async () => {
  const response = await fetch("https://api.unsplash.com/photos/random?count=30&client_id=YOUR_ACCESS_KEY");
  const json = await response.json();
  return json;
});


/**
 * AppCheck enforcement is disabled for this function.
 * @see {@link https://firebase.google.com/docs/app-check/cloud-functions}
 */
export const getGoogleFont = onCall({ enforceAppCheck: false }, async (request) => {
  const font = request.data.font;
  const text = request.data.text;
  const unsplashUrl = `https://fonts.googleapis.com/css2?family=${font}&text=${text}`;
  const response = await fetch(unsplashUrl);
  const css = await response.text();
  return css;
});

/**
 * AppCheck enforcement is disabled for this function.
 * @see {@link https://firebase.google.com/docs/app-check/cloud-functions}
 */
export const getResizedImage = onCall({ enforceAppCheck: false }, async (request) => {
  const imageUrl = request.data.imageUrl;
  try {
    const storage = getStorage();
    const bucket = storage.bucket(GCS_BUCKET.value());
    const file = bucket.file(imageUrl);
    const [metadata] = await file.getMetadata();
    const cacheControl = metadata.cacheControl;
    return cacheControl;
  } catch (error) {
    console.error("Error getting image metadata:", error);
    throw new HttpsError("internal", "Could not get image metadata");
  }
});

export const grantAdminRole = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  
  if (!uid) {
    throw new HttpsError("unauthenticated", "You must be logged in to call this function.");
  }
  
  try {
    const auth = getAuth();
    const firestore = getFirestore();

    // Set the custom claim 'role' to 'Admin'
    await auth.setCustomUserClaims(uid, { role: "Admin" });
    
    // Update the 'role' field in the user's Firestore document
    await firestore.collection("users").doc(uid).set({
      role: "Admin"
    }, { merge: true });

    return { message: `Successfully granted Admin role to user ${uid}. Please refresh the application.` };
  } catch (error) {
    console.error(`Error granting admin role to ${uid}:`, error);
    throw new HttpsError("internal", "An error occurred while setting user claims.");
  }
});
