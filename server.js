const express = require('express');
const admin = require('firebase-admin');
const path = require('path'); // We need this to find your files!

const app = express();
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(express.json());

// CRITICAL FIX: Tell the server to look inside the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/skills', async (req, res) => {
  const snapshot = await db.collection('skills').get();
  const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(skills);
});

app.post('/api/skills', async (req, res) => {
  const newSkill = req.body;
  const docRef = await db.collection('skills').add(newSkill);
  res.json({ id: docRef.id });
});

app.delete('/api/skills/:id', async (req, res) => {
  await db.collection('skills').doc(req.params.id).delete();
  res.json({ message: 'Deleted' });
});

// If someone goes to the home page, send them the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});