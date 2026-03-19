const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

const app = express();

// Load the Firebase Secret Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Middleware to handle JSON data
app.use(express.json());

// 1. Tell the server to serve all your CSS/JS/Images from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 2. API Routes for the Database
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
    const newSkill = req.body;
    const docRef = await db.collection('skills').add(newSkill);
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

// 3. THE FIX: The catch-all route to send the HTML file
// We use (.*) which is the modern way to say "match everything"
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 4. Start the server on the Cloud port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});