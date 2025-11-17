
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

async function deleteAllViewCounts() {
  const collectionRef = db.collection('wiki_pages');
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log('No documents found in wiki_pages collection.');
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { viewCount: admin.firestore.FieldValue.delete() });
  });

  await batch.commit();
  console.log(`Successfully deleted viewCount field from ${snapshot.size} documents.`);
}

deleteAllViewCounts().catch(console.error);
