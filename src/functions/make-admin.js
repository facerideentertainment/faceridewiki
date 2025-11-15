const admin = require('firebase-admin');

// Your project ID from the Firebase config
const projectId = 'studio-3687522943-485ca';

// Initialize the Admin SDK
admin.initializeApp({ projectId });

const auth = admin.auth();

// The email of the user to make an admin
const emailToMakeAdmin = 'maxplasss@gmail.com';

(async () => {
  try {
    // Get the user by email
    const user = await auth.getUserByEmail(emailToMakeAdmin);

    // Get existing custom claims
    const existingClaims = user.customClaims || {};

    // Set the 'role' custom claim
    await auth.setCustomUserClaims(user.uid, { ...existingClaims, role: 'Admin' });

    console.log(`Successfully made '${emailToMakeAdmin}' an admin.`);

  } catch (error) {
    console.error(`Error making user an admin: ${error.message}`);
  } 
})();