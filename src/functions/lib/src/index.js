"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeUserEditor = exports.syncUsers = exports.setRole = void 0;
const firebase_functions_1 = require("firebase-functions");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
// IMPORTANT: The v2 Auth trigger is not yet supported.
// We must use the v1 syntax for the onUserDeleted trigger.
const functions = require("firebase-functions/v1");
(0, app_1.initializeApp)();
exports.setRole = firebase_functions_1.https.onCall(async (request) => {
    const { auth, data } = request;
    if ((auth === null || auth === void 0 ? void 0 : auth.token.role) !== 'Admin') {
        throw new firebase_functions_1.https.HttpsError('permission-denied', 'Only admins can set user roles.');
    }
    const { uid, role } = data;
    if (typeof uid !== 'string' || !['Admin', 'Editor', 'Viewer'].includes(role)) {
        throw new firebase_functions_1.https.HttpsError('invalid-argument', 'The function must be called with a string UID and a valid role.');
    }
    try {
        await (0, auth_1.getAuth)().setCustomUserClaims(uid, { role: role });
        await (0, firestore_1.getFirestore)().collection('users').doc(uid).update({ role: role });
        return { message: `Success! ${uid} has been made a ${role}.` };
    }
    catch (error) {
        console.error(error);
        throw new firebase_functions_1.https.HttpsError('internal', 'An error occurred while setting the user role.');
    }
});
/**
 * A Cloud Function that triggers when a user is deleted from Firebase Authentication.
 * It deletes the corresponding user document from the 'users' collection in Firestore.
 */
// 🔑 CORRECTION: Changed from onUserDeleted(async (event) to functions.auth.user().onDelete(async (user)
exports.onuserdeleted = functions.runWith({ codebase: 'functionsv1' }).auth.user().onDelete(async (user) => {
    const uid = user.uid; // Access UID directly from the 'user' object in v1
    firebase_functions_1.logger.info(`User with UID: ${uid} has been deleted. Deleting their document from Firestore.`);
    try {
        const userDocRef = (0, firestore_1.getFirestore)().collection("users").doc(uid);
        await userDocRef.delete();
        firebase_functions_1.logger.info(`Successfully deleted Firestore document for user: ${uid}`);
    }
    catch (error) {
        firebase_functions_1.logger.error(`Error deleting Firestore document for user: ${uid}`, error);
    }
});
/**
 * A callable Cloud Function for admins to clean up Firestore user documents
 * that do not have a corresponding Firebase Auth user.
 */
exports.syncUsers = firebase_functions_1.https.onCall(async (request) => {
    const { auth } = request;
    // 1. Authorization: Only Admins can run this.
    if ((auth === null || auth === void 0 ? void 0 : auth.token.role) !== 'Admin') {
        throw new firebase_functions_1.https.HttpsError('permission-denied', 'Only admins can sync users.');
    }
    firebase_functions_1.logger.info("Starting user sync process...");
    try {
        // 2. Get all UIDs from Firestore 'users' collection.
        const firestore = (0, firestore_1.getFirestore)();
        const usersCollection = firestore.collection('users');
        const firestoreUsersSnapshot = await usersCollection.get();
        const firestoreUserIds = new Set(firestoreUsersSnapshot.docs.map(doc => doc.id));
        firebase_functions_1.logger.info(`Found ${firestoreUserIds.size} user documents in Firestore.`);
        // 3. Get all UIDs from Firebase Auth.
        const authUsers = await (0, auth_1.getAuth)().listUsers(1000); // Up to 1000 users per page
        const authUserIds = new Set(authUsers.users.map(user => user.uid));
        // Note: For more than 1000 users, you would need to handle pagination.
        firebase_functions_1.logger.info(`Found ${authUserIds.size} users in Firebase Authentication.`);
        // 4. Find the difference: UIDs in Firestore but not in Auth.
        const ghostUserIds = [];
        firestoreUserIds.forEach(id => {
            if (!authUserIds.has(id)) {
                ghostUserIds.push(id);
            }
        });
        firebase_functions_1.logger.info(`Found ${ghostUserIds.length} ghost user documents to delete.`);
        if (ghostUserIds.length === 0) {
            return { deletedCount: 0, message: "No ghost users found. Database is in sync." };
        }
        // 5. Delete the ghost user documents from Firestore in a batch.
        const batch = firestore.batch();
        ghostUserIds.forEach(id => {
            const userDocRef = usersCollection.doc(id);
            batch.delete(userDocRef);
            firebase_functions_1.logger.info(`Queueing deletion for ghost user: ${id}`);
        });
        await batch.commit();
        firebase_functions_1.logger.info(`Successfully deleted ${ghostUserIds.length} ghost user documents.`);
        return { deletedCount: ghostUserIds.length };
    }
    catch (error) {
        firebase_functions_1.logger.error("Error during user sync:", error);
        throw new firebase_functions_1.https.HttpsError('internal', 'An error occurred while syncing users.');
    }
});
// This is a temporary function to grant the Editor role to a specific user.
// You should deploy this, run it once by visiting its URL, and then remove it.
exports.makeUserEditor = functions.runWith({ codebase: 'functionsv1' }).https.onRequest(async (req, res) => {
    try {
        const uid = 'dKUnvQBuaLZXazoV1UaQMXjIgTx2';
        await (0, auth_1.getAuth)().setCustomUserClaims(uid, { role: 'Editor' });
        // Also update the role in the user's Firestore document
        await (0, firestore_1.getFirestore)().collection('users').doc(uid).update({ role: 'Editor' });
        firebase_functions_1.logger.info(`Successfully set role 'Editor' for user ${uid}`);
        res.status(200).send(`Successfully set role 'Editor' for user ${uid}`);
    }
    catch (error) {
        firebase_functions_1.logger.error("Error in makeUserEditor:", error);
        res.status(500).send("An error occurred while setting the user role.");
    }
});
//# sourceMappingURL=index.js.map