import * as functions from 'firebase-functions/v1';
export declare const setRole: functions.HttpsFunction & functions.Runnable<any>;
/**
 * A callable Cloud Function for admins to clean up Firestore user documents
 * that do not have a corresponding Firebase Auth user.
 */
export declare const syncUsers: functions.HttpsFunction & functions.Runnable<any>;
export declare const makeUserEditor: functions.HttpsFunction;
