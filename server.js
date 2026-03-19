const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

const app = express();

// Load Firebase
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.use(express.json());

// 1. Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 2. API Routes
app.get('/api/skills', async (req, res) => {
  try {
    const snapshot = await db.collection('skills').get();
    const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/skills', async (req, res) => {
  try {
    const docRef = await db.collection('skills').add(req.body);
    res.json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    await db.collection('skills').doc(req.params.id).delete();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. THE SAFE FIX: Instead of '*', we target the root '/' and use a basic function
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 4. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});