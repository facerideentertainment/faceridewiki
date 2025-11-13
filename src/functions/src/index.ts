
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, WriteBatch } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onUserCreated, onUserDeleted } from "firebase-functions/v2/auth";
import { logger } from "firebase-functions/v2";

// Initialize the Firebase Admin SDK
initializeApp();

/**
 * 2nd Gen Cloud Function that triggers when a user is created.
 * Creates a corresponding user document in Firestore.
 */
export const onusercreated = onUserCreated(async (event) => {
    const user = event.data;
    const { uid, email, displayName, photoURL } = user;
    logger.info(`New user created: ${uid} (${email})`);

    try {
        const userDocRef = getFirestore().collection("users").doc(uid);
        await userDocRef.set({
            uid,
            email,
            displayName: displayName || null,
            photoURL: photoURL || null,
            role: 'Viewer', // Default role
            createdAt: FieldValue.serverTimestamp(),
        });
        logger.info(`Successfully created Firestore document for user: ${uid}`);
    } catch (error) {
        logger.error(`Error creating Firestore document for user: ${uid}`, error);
    }
});

/**
 * 2nd Gen Cloud Function that triggers when a user is deleted.
 * Deletes the corresponding user document from Firestore.
 */
export const onuserdeleted = onUserDeleted(async (event) => {
    const user = event.data;
    const { uid } = user;
    logger.info(`User with UID: ${uid} has been deleted. Deleting their document from Firestore.`);
 
    try {
      const userDocRef = getFirestore().collection("users").doc(uid);
      await userDocRef.delete();
      logger.info(`Successfully deleted Firestore document for user: ${uid}`);
    } catch (error) {
      logger.error(`Error deleting Firestore document for user: ${uid}`, error);
    }
});

/**
 * 2nd Gen callable Cloud Function to set a user's role.
 * Requires the caller to be an Admin.
 */
export const setRole = onCall(async (request) => {
    const { auth, data } = request;

    if (auth?.token.role !== 'Admin') {
        throw new HttpsError('permission-denied', 'Only admins can set user roles.');
    }

    const { uid, role } = data;

    if (typeof uid !== 'string' || !['Admin', 'Editor', 'Viewer'].includes(role)) {
        throw new HttpsError('invalid-argument', 'The function must be called with a string UID and a valid role.');
    }

    try {
        await getAuth().setCustomUserClaims(uid, { role: role });
        await getFirestore().collection('users').doc(uid).update({ role: role });
        
        logger.info(`Success! ${uid} has been made a ${role}.`);
        return { message: `Success! ${uid} has been made a ${role}.` };
    } catch (error) {
        logger.error("Error setting role:", error);
        throw new HttpsError('internal', 'An error occurred while setting the user role.');
    }
});

/**
 * 2nd Gen callable Cloud Function for admins to sync Firestore and Auth users.
 * Deletes Firestore user documents that do not have a corresponding Firebase Auth user.
 */
export const syncUsers = onCall(async (request) => {
    const { auth } = request;

    if (auth?.token.role !== 'Admin') {
        throw new HttpsError('permission-denied', 'Only admins can sync users.');
    }

    logger.info("Starting user sync process...");

    try {
        const firestore = getFirestore();
        const usersCollection = firestore.collection('users');
        const firestoreUsersSnapshot = await usersCollection.get();
        const firestoreUserIds = new Set(firestoreUsersSnapshot.docs.map(doc => doc.id));
        logger.info(`Found ${firestoreUserIds.size} user documents in Firestore.`);

        // Get all UIDs from Firebase Auth. Note: For more than 1000 users, handle pagination.
        const authUsers = await getAuth().listUsers(1000);
        const authUserIds = new Set(authUsers.users.map(user => user.uid));
        logger.info(`Found ${authUserIds.size} users in Firebase Authentication.`);

        // Find UIDs in Firestore that are not in Auth.
        const ghostUserIds: string[] = [];
        firestoreUserIds.forEach(id => {
            if (!authUserIds.has(id)) {
                ghostUserIds.push(id);
            }
        });

        logger.info(`Found ${ghostUserIds.length} ghost user documents to delete.`);

        if (ghostUserIds.length === 0) {
            return { deletedCount: 0, message: "No ghost users found. Database is in sync." };
        }

        // Delete the ghost user documents from Firestore in a batch.
        const batch: WriteBatch = firestore.batch();
        ghostUserIds.forEach(id => {
            const userDocRef = usersCollection.doc(id);
            batch.delete(userDocRef);
            logger.info(`Queueing deletion for ghost user: ${id}`);
        });

        await batch.commit();
        logger.info(`Successfully deleted ${ghostUserIds.length} ghost user documents.`);
        
        return { deletedCount: ghostUserIds.length };

    } catch (error) {
        logger.error("Error during user sync:", error);
        throw new HttpsError('internal', 'An error occurred while syncing users.');
    }
});
