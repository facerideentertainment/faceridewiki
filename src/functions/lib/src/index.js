"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUsers = exports.makeFirstUserAdmin = exports.setRole = exports.onuserdeleted = exports.onusercreated = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const v2_1 = require("firebase-functions/v2");
// Initialize the Firebase Admin SDK
(0, app_1.initializeApp)();
/**
 * 1st Gen Cloud Function that triggers when a user is created.
 * Creates a corresponding user document in Firestore.
 */
exports.onusercreated = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName, photoURL } = user;
    v2_1.logger.info(`New user created: ${uid} (${email})`);
    try {
        const userDocRef = (0, firestore_1.getFirestore)().collection("users").doc(uid);
        await userDocRef.set({
            uid,
            email,
            displayName: displayName || null,
            photoURL: photoURL || null,
            role: 'Viewer', // Default role
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        v2_1.logger.info(`Successfully created Firestore document for user: ${uid}`);
    }
    catch (error) {
        v2_1.logger.error(`Error creating Firestore document for user: ${uid}`, error);
    }
});
/**
 * 1st Gen Cloud Function that triggers when a user is deleted.
 * Deletes the corresponding user document from Firestore.
 */
exports.onuserdeleted = functions.auth.user().onDelete(async (user) => {
    const { uid } = user;
    v2_1.logger.info(`User with UID: ${uid} has been deleted. Deleting their document from Firestore.`);
    try {
        const userDocRef = (0, firestore_1.getFirestore)().collection("users").doc(uid);
        await userDocRef.delete();
        v2_1.logger.info(`Successfully deleted Firestore document for user: ${uid}`);
    }
    catch (error) {
        v2_1.logger.error(`Error deleting Firestore document for user: ${uid}`, error);
    }
});
/**
 * 2nd Gen callable Cloud Function to set a user's role.
 * Requires the caller to be an Admin.
 */
exports.setRole = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if ((auth === null || auth === void 0 ? void 0 : auth.token.role) !== 'Admin') {
        throw new https_1.HttpsError('permission-denied', 'Only admins can set user roles.');
    }
    const { uid, role } = data;
    if (typeof uid !== 'string' || !['Admin', 'Editor', 'Viewer'].includes(role)) {
        throw new https_1.HttpsError('invalid-argument', 'The function must be called with a string UID and a valid role.');
    }
    try {
        await (0, auth_1.getAuth)().setCustomUserClaims(uid, { role: role });
        await (0, firestore_1.getFirestore)().collection('users').doc(uid).update({ role: role });
        v2_1.logger.info(`Success! ${uid} has been made a ${role}.`);
        return { message: `Success! ${uid} has been made a ${role}.` };
    }
    catch (error) {
        v2_1.logger.error("Error setting role:", error);
        throw new https_1.HttpsError('internal', 'An error occurred while setting the user role.');
    }
});
/**
 * 2nd Gen callable Cloud Function to make the caller the first admin.
 * Will fail if an admin already exists.
 */
exports.makeFirstUserAdmin = (0, https_1.onCall)(async (request) => {
    const { auth } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to call this function.');
    }
    const firestore = (0, firestore_1.getFirestore)();
    const adminAuth = (0, auth_1.getAuth)();
    // Check if an admin already exists
    const usersCollection = firestore.collection('users');
    const adminSnapshot = await usersCollection.where('role', '==', 'Admin').limit(1).get();
    if (!adminSnapshot.empty) {
        throw new https_1.HttpsError('already-exists', 'An admin user already exists.');
    }
    // If no admin exists, make the caller an admin.
    const uid = auth.uid;
    const role = 'Admin';
    try {
        await adminAuth.setCustomUserClaims(uid, { role: role });
        await usersCollection.doc(uid).update({ role: role });
        v2_1.logger.info(`Success! ${uid} has been made the first Admin.`);
        return { message: `Success! You have been made an Admin.` };
    }
    catch (error) {
        v2_1.logger.error("Error setting first admin role:", error);
        throw new https_1.HttpsError('internal', 'An error occurred while setting the user role.');
    }
});
/**
 * 2nd Gen callable Cloud Function for admins to sync Firestore and Auth users.
 * Deletes Firestore user documents that do not have a corresponding Firebase Auth user.
 */
exports.syncUsers = (0, https_1.onCall)(async (request) => {
    const { auth } = request;
    if ((auth === null || auth === void 0 ? void 0 : auth.token.role) !== 'Admin') {
        throw new https_1.HttpsError('permission-denied', 'Only admins can sync users.');
    }
    v2_1.logger.info("Starting user sync process...");
    try {
        const firestore = (0, firestore_1.getFirestore)();
        const usersCollection = firestore.collection('users');
        const firestoreUsersSnapshot = await usersCollection.get();
        const firestoreUserIds = new Set(firestoreUsersSnapshot.docs.map(doc => doc.id));
        v2_1.logger.info(`Found ${firestoreUserIds.size} user documents in Firestore.`);
        // Get all UIDs from Firebase Auth. Note: For more than 1000 users, handle pagination.
        const authUsers = await (0, auth_1.getAuth)().listUsers(1000);
        const authUserIds = new Set(authUsers.users.map(user => user.uid));
        v2_1.logger.info(`Found ${authUserIds.size} users in Firebase Authentication.`);
        // Find UIDs in Firestore that are not in Auth.
        const ghostUserIds = [];
        firestoreUserIds.forEach(id => {
            if (!authUserIds.has(id)) {
                ghostUserIds.push(id);
            }
        });
        v2_1.logger.info(`Found ${ghostUserIds.length} ghost user documents to delete.`);
        if (ghostUserIds.length === 0) {
            return { deletedCount: 0, message: "No ghost users found. Database is in sync." };
        }
        // Delete the ghost user documents from Firestore in a batch.
        const batch = firestore.batch();
        ghostUserIds.forEach(id => {
            const userDocRef = usersCollection.doc(id);
            batch.delete(userDocRef);
            v2_1.logger.info(`Queueing deletion for ghost user: ${id}`);
        });
        await batch.commit();
        v2_1.logger.info(`Successfully deleted ${ghostUserIds.length} ghost user documents.`);
        return { deletedCount: ghostUserIds.length };
    }
    catch (error) {
        v2_1.logger.error("Error during user sync:", error);
        throw new https_1.HttpsError('internal', 'An error occurred while syncing users.');
    }
});
//# sourceMappingURL=index.js.map