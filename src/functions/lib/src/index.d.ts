import * as functions from "firebase-functions";
/**
 * 1st Gen Cloud Function that triggers when a user is created.
 * Creates a corresponding user document in Firestore.
 */
export declare const onusercreated: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
/**
 * 1st Gen Cloud Function that triggers when a user is deleted.
 * Deletes the corresponding user document from Firestore.
 */
export declare const onuserdeleted: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
/**
 * 2nd Gen callable Cloud Function to set a user's role.
 * Requires the caller to be an Admin.
 */
export declare const setRole: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    message: string;
}>>;
/**
 * 2nd Gen callable Cloud Function to make the caller the first admin.
 * Will fail if an admin already exists.
 */
export declare const makeFirstUserAdmin: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    message: string;
}>>;
/**
 * 2nd Gen callable Cloud Function for admins to sync Firestore and Auth users.
 * Deletes Firestore user documents that do not have a corresponding Firebase Auth user.
 */
export declare const syncUsers: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    deletedCount: number;
    message: string;
} | {
    deletedCount: number;
    message?: undefined;
}>>;
